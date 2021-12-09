<template>
  <div
    ref="elRoot"
    class="sky-cloud"
    :style="rootStyle"
    :data-cloud-id="cloud.id"
    :data-cloud-type="cloud.type"
  >
    <component
      ref="elCloud"
      :is="SkyCloudComponents[cloud.type]"
      :cloud="cloud"
      class="sky-bird"
      v-bind="$attrs"
    />
    <i class="border-before" />
  </div>
</template>
<script>
export default {
  name: 'Cloud',
  inheritAttrs: false,
};
</script>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';

const SkyCloudComponents = inject('SkyCloudComponents');

const props = defineProps({
  cloud: {
    type: Object,
    require: true,
    default: () => ({}),
  },
});

const elRoot = ref();

const rootStyle = computed(() => {
  return {
    opacity: props.cloud.opacity,
  };
});

onMounted(() => {
  // 不做成 computed
  // cloud width height top left 变更
  // 调用 sky.cloud.updateCloudsElementRect 更新 sky-cloud
  // 避免不必要开销
  Object.assign(elRoot.value.style, {
    width: `${props.cloud.width}px`,
    height: `${props.cloud.height}px`,
    top: `${props.cloud.top}px`,
    left: `${props.cloud.left}px`,
  });
});
</script>
