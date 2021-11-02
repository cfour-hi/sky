<template>
  <div class="sky-renderer" :style="rootStyle">
    <div class="sky-background" :style="backgroundStyle"></div>

    <component
      v-for="cloud in clouds"
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
import { computed, inject } from 'vue';
import Clouds from './Clouds.vue';
import Cloud from './Cloud.vue';

const props = defineProps({
  background: {
    type: Object,
    required: true,
  },

  clouds: {
    type: Array,
    default: () => [],
  },
});

const rootStyle = computed(() => {
  return {
    width: `${sky.state.width}px`,
    height: `${sky.state.height}px`,
  };
});

const backgroundStyle = computed(() => {
  return {
    background: props.background.color,
    opacity: props.background.opacity ?? 1,
  };
});

function toComponent(cloud) {
  if (cloud.type === 'clouds') {
    return Clouds;
  }
  return Cloud;
}
</script>
