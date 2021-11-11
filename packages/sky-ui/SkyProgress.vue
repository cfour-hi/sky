<template>
  <div class="sky-progress">
    <div class="sky-progress-outer">
      <div class="sky-progress-inner">
        <div class="sky-progress-bg" :style="bgStyle"></div>
      </div>
    </div>

    <span class="sky-progress-text">{{ percent }}%</span>
  </div>
</template>

<script>
export default {
  name: 'SkyProgress',
};
</script>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  percent: {
    type: Number,
    default: 0,
  },
});

const bgStyle = computed(() => ({
  width: `${props.percent}%`,
}));
</script>

<style lang="scss" scoped>
.sky-progress {
  @apply flex items-center;
}

.sky-progress-outer {
  @apply w-full;
}

.sky-progress-inner {
  @apply w-full overflow-hidden bg-gray-100 rounded-full;
}

.sky-progress-bg {
  @apply bg-blue-700 rounded-full h-2 transform transition-all duration-150 w-0;
}

.ant-progress-circle-trail {
  stroke: #f5f5f5;
}

.ant-progress-circle-path {
  stroke: rgba(29, 78, 216, var(--tw-bg-opacity));
}

.sky-progress-text {
  @apply text-sm w-11 text-right;
}
</style>
