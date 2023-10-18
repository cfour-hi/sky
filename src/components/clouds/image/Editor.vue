<template>
  <CloudImage v-bind="$attrs" />
</template>

<script>
export default {
  name: 'CloudImageEditor',
};
</script>

<script setup>
import CloudImage from './index.vue';

const skyHooks = {
  moveable: {
    keepRatio: ['ne', 'nw', 'sw', 'se'],
  },
};

defineExpose({ skyHooks });
</script>
