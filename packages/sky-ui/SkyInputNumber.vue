<template>
  <div :class="rootClass">
    <SkyInput
      type="number"
      v-bind="attrs"
      @input="handleInput"
      @change="handleChange"
    />

    <div
      class="sky-input__number-arrow flex-center top-0"
      :class="{ 'sky-disabled': disableIncrease }"
      @click="handleClickArrowUp"
    >
      <svg-icon filename="arrow-up" />
    </div>

    <div
      class="sky-input__number-arrow flex-center bottom-0"
      :class="{ 'sky-disabled': disableDecrease }"
      style="transform: rotateX(180deg)"
      @click="handleClickArrowDown"
    >
      <svg-icon filename="arrow-up" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkyInputNumber',
  inheritAttrs: false,
};
</script>

<script setup>
import { computed, useAttrs } from 'vue';
import SkyInput from './SkyInput.vue';
import { toNumber } from './tool';

const props = defineProps({
  min: Number,
  max: Number,
  decimal: {
    type: Number,
    default: 0,
  },
  step: {
    type: Number,
    default: 1,
  },
  class: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['input', 'change']);
const attrs = useAttrs();

const rootClass = computed(() => {
  const base = 'sky-input__number';
  const classs = [base, props.class];
  if (attrs.size) classs.push(`${base}--${attrs.size}`);
  if (attrs.readonly !== undefined) classs.push(`${base}-readonly`);
  return classs;
});

const disableIncrease = computed(() => {
  return typeof props.max === 'number' && attrs.value >= props.max;
});

const disableDecrease = computed(() => {
  return typeof props.min === 'number' && attrs.value <= props.min;
});

function _toNumber(value) {
  value = Number(value);

  if (typeof props.min === 'number') {
    if (value < props.min) value = props.min;
    if (value > props.max) value = props.max;
  }

  return value;
}

function handleInput(value, event) {
  emit('input', _toNumber(value), event);
}

function handleChange(value, event) {
  emit('change', _toNumber(value), event);
}

function handleClickArrowUp() {
  if (disableIncrease.value) return;

  emit(
    'change',
    toNumber(attrs.value + props.step, { decimal: props.decimal }),
  );
}

function handleClickArrowDown() {
  if (disableDecrease.value) return;

  emit(
    'change',
    toNumber(attrs.value - props.step, { decimal: props.decimal }),
  );
}
</script>

<style lang="scss" scoped>
.sky-input__number {
  @apply relative inline-block;

  $input-inner: ':deep .sky-input__inner:not(:read-only)';

  #{$input-inner} {
    @apply pr-5;
  }

  $arrow: #{&}-arrow;

  #{$arrow} {
    @apply absolute  right-0 w-5 h-1/2 text-gray-500 cursor-pointer;

    .svg-icon {
      @apply mt-1;
      font-size: 10px;
    }

    &.sky-disabled {
      @apply text-gray-300 cursor-not-allowed;
    }
  }

  &-readonly {
    #{$arrow} {
      @apply text-gray-300;
    }
  }

  &--small {
    #{$arrow} {
      @apply w-3.5;

      .svg-icon {
        @apply mt-0.5;
        font-size: 8px;
      }
    }

    #{$input-inner} {
      @apply pr-3.5;
    }
  }
}
</style>
