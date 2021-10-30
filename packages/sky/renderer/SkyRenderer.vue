<script>
export default {
  name: 'SkyRenderer',
  inheritAttrs: false,
};
</script>

<script setup>
import { computed, inject } from 'vue';
import { SKY_CLOUD_LOCK } from '../constants';
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
</script>

<template>
  <div class="sky-renderer" :style="rootStyle">
    <div class="sky-background" :style="backgroundStyle"></div>

    <template v-for="cloud in clouds" v-memo="[cloud.id]">
      <Clouds
        v-if="cloud.type === 'clouds'"
        :key="cloud.id"
        :cloud="cloud"
        v-bind="$attrs"
      />

      <Cloud v-else :key="cloud.id" :cloud="cloud" v-bind="$attrs" />
    </template>
  </div>
</template>
