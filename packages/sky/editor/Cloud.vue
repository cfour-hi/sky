<template>
  <CloudRenderer :cloud="props.cloud" :class="toCloudClass(cloud)" />
</template>
<script>
export default {
  name: 'CloudEditor',
  inheritAttrs: false,
};
</script>

<script setup>
import {
  ref,
  onMounted,
  inject,
  getCurrentInstance,
  onBeforeUnmount,
} from 'vue';
import { SKY_CLOUD_LOCK } from '../constants';
import CloudRenderer from '../renderer/Cloud.vue';

const sky = inject('sky');

const props = defineProps({
  cloud: {
    type: Object,
    require: true,
    default: () => ({}),
  },
});

const elRoot = ref();

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
  sky.birdVM[props.cloud.id] =
    vm.subTree.component.subTree.children[0].component;
});

onBeforeUnmount(() => {
  // 必须在 onBeforeUnmount 移除
  // 不能在 onUnmounted 移除
  // 组件的更新
  // 会先执行新创建的实例
  // 再销毁老的实例
  Reflect.deleteProperty(sky.cloudVM, props.cloud.id);
  Reflect.deleteProperty(sky.birdVM, props.cloud.id);
});

function toCloudClass(cloud) {
  return {
    [SKY_CLOUD_LOCK]: cloud.lock,
  };
}
</script>
