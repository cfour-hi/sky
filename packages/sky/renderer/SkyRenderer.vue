<template>
  <div class="sky-renderer">
    <div :class="backgroundClass" :style="props.state.bgStyle"></div>

    <component
      v-for="cloud in props.state.clouds"
      :key="cloud.id"
      :is="toComponent(cloud)"
      :cloud="cloud"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
export default {
  name: 'SkyRenderer',
  inheritAttrs: false,
};
</script>

<script setup>
import Clouds from './Clouds.vue';
import Cloud from './Cloud.vue';
import { SKY_BACKGROUND } from '../constants';

const props = defineProps({
  state: Object,
  cloudComponents: {
    type: Object,
    default: () => ({}),
  },
});

const backgroundClass = [SKY_BACKGROUND];

function toComponent(cloud) {
  if (cloud.type === 'clouds') {
    return props.cloudComponents.Clouds || Clouds;
  }
  return props.cloudComponents.Cloud || Cloud;
}
</script>
