<template>
  <div class="sky-tab-panel" :style="rootStyle">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SkyTabPanel',
};
</script>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue';

const vm = getCurrentInstance();
vm.parent.exposed.tabs.value.push(vm);

defineProps({
  // SkyTabs 会用到 label
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
