<template>
  <CloudsRenderer :cloud="cloud" :class="toCloudClass(cloud)" />
</template>

<script>
export default {
  name: 'CloudsEditor',
  inheritAttrs: false,
};
</script>

<script setup>
import {
  getCurrentInstance,
  inject,
  onMounted,
  onBeforeUnmount,
  ref,
} from 'vue';
import { SKY_CLOUD_LOCK, CLOUD_RENDER_DIRECTIONS } from '../constants';
import CloudsRenderer from '../renderer/Clouds.vue';

const sky = inject('sky');

const props = defineProps({
  cloud: {
    type: Object,
    required: true,
  },
});

const skyHooks = {
  moveable: {
    renderDirections: [...CLOUD_RENDER_DIRECTIONS],
    keepRatio: [...CLOUD_RENDER_DIRECTIONS],
  },
};

const elRoot = ref();

onMounted(() => {
  const vm = getCurrentInstance();
  sky.cloudVM[props.cloud.id] = vm;
  sky.birdVM[props.cloud.id] = vm;
});

onBeforeUnmount(() => {
  Reflect.deleteProperty(sky.cloudVM, props.cloud.id);
  Reflect.deleteProperty(sky.birdVM, props.cloud.id);
});

function toCloudClass(cloud) {
  return {
    [SKY_CLOUD_LOCK]: cloud.lock,
  };
}

defineExpose({ skyHooks });
</script>
