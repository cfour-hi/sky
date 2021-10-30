<script>
export default {
  name: 'SkyTabPanel',
};
</script>

<script setup>
import { computed, getCurrentInstance, onMounted, ref } from 'vue';

const vm = getCurrentInstance();
vm.parent.setupState.tabs.push(vm);

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
});

const active = ref(false);
const rootStyle = computed(() => ({
  display: active.value ? 'block' : 'none',
}));

function changeActive(value) {
  active.value = value;
}

defineExpose({
  changeActive,
});
</script>

<template>
  <div class="sky-tab-panel" :style="rootStyle">
    <slot />
  </div>
</template>
