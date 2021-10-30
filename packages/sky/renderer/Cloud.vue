<template>
  <div
    ref="elRoot"
    class="sky-cloud"
    :class="toCloudClass(cloud)"
    :style="rootStyle"
    :id="cloud.id"
    :data-cloud-id="cloud.id"
  >
    <component
      ref="elCloud"
      :is="toCloudComponent(cloud.type)"
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
import {
  ref,
  computed,
  onMounted,
  inject,
  getCurrentInstance,
  onBeforeUnmount,
  onUnmounted,
  onBeforeMount,
  onBeforeUpdate,
  onUpdated,
} from 'vue';
import { SKY_CLOUD_LOCK } from '../constants';
import { toCloudReflowStyle } from './helper';

const mr = Math.random();

const sky = inject('sky');
const SkyCloudComponents = inject('SkyCloudComponents');

const props = defineProps({
  cloud: {
    type: Object,
    require: true,
    default: () => ({}),
  },
});

const elRoot = ref();
const elCloud = ref();

const rootStyle = computed(() => ({ opacity: props.cloud.opacity }));

/**
 * 当前 cloud 被删除会导致之后的 cloud 重载
 * 生命周期执行顺序
 * A: onBeforeUnmount
 * new B: setup
 * new B: onBeforeMount
 * old B: onBeforeUnmount
 * A: onUnmounted
 * new B: onMounted
 * old B: onUnmounted
 */

onMounted(() => {
  const vm = getCurrentInstance();
  sky.cloudVM[props.cloud.id] = vm;
  sky.birdVM[props.cloud.id] = vm.subTree.children[0].component;

  // 不做成 computed
  // cloud width height top left 变更
  // 调用 sky.cloud.updateCloudsElementRect 更新 sky-cloud
  // 避免不必要开销
  Object.assign(elRoot.value.style, toCloudReflowStyle(props.cloud));
});

onBeforeUnmount(() => {
  // 必须在 onBeforeUnmount 移除
  // 不能在 onUnmounted 移除
  // 组件的更新
  // 会先执行新创建的实例
  // 再销毁老的实例
  Reflect.deleteProperty(sky.cloudVM, props.cloud.id);
});

function toCloudClass(cloud) {
  return {
    [SKY_CLOUD_LOCK]: cloud.lock,
  };
}

function toCloudComponent(type) {
  return SkyCloudComponents[type];
}
</script>
