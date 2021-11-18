<template>
  <div
    ref="elRoot"
    :class="toCloudClass(cloud)"
    class="sky-cloud sky-clouds sky-bird"
    :data-cloud-id="cloud.id"
  >
    <!-- resize 时 scale -->
    <div>
      <template v-for="subCloud in cloud.clouds" :key="subCloud.id">
        <Clouds
          v-if="subCloud.type === 'clouds'"
          :cloud="subCloud"
          v-bind="$attrs"
        />
        <Cloud v-else :cloud="subCloud" v-bind="$attrs" />
      </template>
    </div>

    <i class="border-before" />
  </div>
</template>

<script>
export default {
  name: 'Clouds',
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
import Cloud from './Cloud.vue';
import { toCloudReflowStyle } from './helper';

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

  Object.assign(elRoot.value.style, toCloudReflowStyle(props.cloud));
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
