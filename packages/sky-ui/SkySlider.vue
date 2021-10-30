<script>
export default {
  name: 'SkySlider',
};
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { registerMoveableElement } from './moveable';
import { toNumber } from './tool';

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },

  min: {
    type: Number,
    default: 0,
  },

  max: {
    type: Number,
    default: 100,
  },

  step: {
    type: Number,
    default: 0, // 0 标识此值无效
  },

  showTooltip: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:value']);

const activeTooltip = ref(false);
const elRoot = ref(null);
const elPointer = ref(null);

let pointerMoveable = null;
let onMousedown = null;
let onMouseup = null;

const difference = computed(() => {
  return Math.round(props.max - props.min);
});

const progress = computed(() => {
  return Math.round(((props.value - props.min) / difference.value) * 100);
});

const progressStyle = computed(() => {
  return {
    width: `${progress.value}%`,
  };
});
const pointerStyle = computed(() => {
  return {
    left: `${progress.value}%`,
  };
});

onMounted(() => {
  pointerMoveable = registerMoveableElement(elRoot.value, {
    onmousedown: onChangeValue,
    onmousemove: onChangeValue,
  });

  onMousedown = () => {
    activeTooltip.value = true;
  };
  onMouseup = () => {
    activeTooltip.value = false;
  };
  elPointer.value.addEventListener('mousedown', onMousedown);
  document.addEventListener('mouseup', onMouseup);
});

onBeforeUnmount(() => {
  pointerMoveable.destroy();
  elPointer.value.removeEventListener('mousedown', onMousedown);
  document.removeEventListener('mouseup', onMouseup);
});

function onChangeValue(position) {
  let value = position.x * difference.value;

  if (props.step > 0) {
    value = Math.round((position.x * props.max) / props.step) * props.step;
  }

  const x = toNumber(value + props.min, { decimal: 2 });
  if (x === props.value) return;

  emit('update:value', x);
}
</script>

<template>
  <div class="sky-slider" ref="elRoot">
    <div class="sky-slider__progress" :style="progressStyle"></div>

    <div ref="elPointer" class="sky-slider__pointer" :style="pointerStyle">
      <SkyTooltip
        v-show="showTooltip"
        :content="value"
        :active="activeTooltip"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sky-slider {
  @apply relative h-4 cursor-pointer;

  &::before {
    content: '';
    @apply absolute top-1/2 left-0 w-full h-0.5 rounded-sm bg-gray-200 transform -translate-y-1/2;
  }

  &__progress {
    @apply absolute h-0.5 top-1/2 rounded-sm bg-blue-700 -translate-y-1/2;
  }

  &__pointer {
    @apply absolute top-1/2 h-3 w-3 bg-white rounded-full shadow transform -translate-x-1/2 -translate-y-1/2 cursor-pointer;
  }
}
</style>
