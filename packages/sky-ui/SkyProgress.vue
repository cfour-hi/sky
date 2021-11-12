<template>
  <div ref="elProgressInner" class="sky-progress" :class="rootClass"></div>
</template>

<script>
export default {
  name: 'SkyProgress',
};
</script>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import ProgressBar from 'progressbar.js';

const props = defineProps({
  percent: {
    type: Number,
    default: 0,
  },

  type: {
    type: String,
    default: 'Line',
    validator: (value) => ['Line', 'Circle', 'SemiCircle'].includes(value),
  },

  options: Object,
});
const elProgressInner = ref();
const rootClass = computed(() => {
  const base = 'sky-progress';
  const classs = [base, `${base}__${props.type}`];
  return classs;
});
let progressBar;

watch(
  () => props.percent,
  (value) => {
    progressBar.animate(value);
    progressBar.setText(`${Math.round(props.percent * 100)}%`);
  },
);

onMounted(() => {
  progressBar = new ProgressBar[props.type](elProgressInner.value, {
    color: '#1D4ED8',
    strokeWidth: 2,
    trailColor: '#E5E7EB',
    trailWidth: 2,
    text: {
      value: `${Math.round(props.percent * 100)}%`,
      style: {},
    },
    ...props.options,
  });
});

onUnmounted(() => {
  progressBar.destroy();
});
</script>

<style lang="scss" scoped>
$base: '.sky-progress';

#{$base} {
  @apply flex;
}
</style>

<style lang="scss">
$base: '.sky-progress';

#{$base} {
  @apply items-center;
}

#{$base}__Line {
  .progressbar-text {
    @apply text-sm w-12 text-right;
  }
}

#{$base}__Circle {
  @apply items-center justify-center;

  .progressbar-text {
    @apply absolute;
  }
}
</style>
