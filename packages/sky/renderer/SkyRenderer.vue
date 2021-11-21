<template>
  <div class="sky-renderer">
    <div class="sky-background" :style="props.state.bgStyle"></div>

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

const props = defineProps({
  state: Object,
});

function toComponent(cloud) {
  if (cloud.type === 'clouds') {
    return Clouds;
  }
  return Cloud;
}
</script>
