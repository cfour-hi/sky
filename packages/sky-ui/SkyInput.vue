<script>
export default {
  name: 'SkyInput',
};
</script>

<script setup>
import { computed, nextTick, ref, useAttrs, useSlots } from 'vue';

const slots = useSlots();
const attrs = useAttrs();

const props = defineProps({
  value: [String, Number],

  type: {
    type: String,
    default: 'text',
  },

  size: {
    type: String,
    default: '',
    validator(value) {
      return !value || ['small', 'large'].includes(value);
    },
  },
});

const emit = defineEmits(['input', 'change']);

const elInput = ref(null);

const rootClass = computed(() => {
  const classs = [];
  if (props.size) classs.push(`sky-input--${props.size}`);
  if (slots.append) classs.push('sky-input--append');
  return classs;
});

function handleInput(event) {
  emit('input', event.target.value, event);
}

function handleChange(event) {
  emit('change', event.target.value, event);

  // 输入之后失焦
  // 如果上层改变 value
  // 输入框内容不会更新
  // 通过以下方式更新输入框内容
  nextTick(() => {
    elInput.value.value = props.value;
  });
}
</script>

<template>
  <div class="sky-input" :class="[...rootClass, attrs.class]">
    <input
      ref="elInput"
      class="sky-input__inner"
      :type="type"
      :value="value"
      v-bind="$attrs"
      @input="handleInput"
      @change="handleChange"
    />

    <div v-if="$slots.append" class="sky-input__append flex-center">
      <slot name="append" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sky-input {
  @apply relative inline-block;

  $input-inner: #{&}__inner;

  #{$input-inner} {
    @apply w-full py-2 px-3 border border-gray-200 text-sm text-gray-700 rounded outline-none;

    &:not(:read-only):hover {
      @apply border-gray-300;
    }

    &:not(:read-only):focus {
      @apply border-blue-500;
    }

    /* Chrome, Safari, Edge, Opera */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      @apply m-0;
    }

    // /* Firefox */
    // &[type='number'] {
    //   -moz-appearance: textfield;
    // }
  }

  &--small {
    #{$input-inner} {
      @apply py-1 px-1.5 text-xs;
    }
  }

  &--large {
    #{$input-inner} {
      @apply py-3 px-4 text-base;
    }
  }

  &--append {
    .sky-input__inner {
      @apply pr-6;
    }
  }

  &__append {
    @apply absolute top-0 right-0 w-6 h-full text-gray-500;
  }
}
</style>
