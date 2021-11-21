<template>
  <div class="sky-tabs">
    <div class="sky-tabs__header">
      <div class="sky-tabs__header-shell">
        <div
          v-for="(tab, index) in tabs"
          :key="tab.props.label"
          class="sky-tab__title"
          :class="{ 'sky-active': tab.props.label === value }"
          @click="onClickTab(tab, index)"
        >
          {{ tab.props.label }}
        </div>

        <div class="sky-tab__slider" :style="sliderStyle"></div>
      </div>
    </div>

    <div class="sky-tabs__content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkyTabs',
};
</script>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['update:value', 'change']);

watch(
  () => props.value,
  () => {
    changeTab();
  },
);

const tabs = ref([]);
const sliderStyle = reactive({ width: 0, left: 0 });
let tabWidth = 0;
onMounted(() => {
  // 初始化数据
  tabWidth = 100 / tabs.value.length;
  sliderStyle.width = `${tabWidth}%`;

  changeTab();
});

let preActiveTabVM = null;
function changeTab(index = -1) {
  if (index < 0) {
    index = tabs.value.findIndex((vm) => vm.props.label === props.value);
  }
  sliderStyle.left = `${tabWidth * index}%`;

  // 切换 tab 内容
  preActiveTabVM?.exposed?.changeActive?.(false);
  preActiveTabVM = tabs.value[index];
  preActiveTabVM.exposed?.changeActive?.(true);
}

function onClickTab(tab, index) {
  emit('update:value', tab.props.label);
  changeTab(index);
}

defineExpose({ tabs });
</script>

<style lang="scss" scoped>
.sky-tabs__header {
  @apply p-0.5 mb-3 rounded bg-gray-100 cursor-pointer;
}

.sky-tabs__header-shell {
  @apply relative flex justify-between;
}

.sky-tab__title {
  @apply relative flex-auto py-1 text-center;
  z-index: 1;

  &.sky-active {
    @apply font-bold;
  }
}

.sky-tab__slider {
  @apply absolute top-0 bottom-0 rounded bg-white shadow transition-all duration-150 ease-in-out;
}
</style>
