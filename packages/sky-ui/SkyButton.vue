<template>
  <button type="button" class="sky-button" :class="rootClass" v-bind="$attrs">
    <slot />
  </button>
</template>

<script>
export default {
  name: 'SkyButton',
};
</script>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  plain: {
    type: Boolean,
    default: false,
  },

  size: {
    type: String,
    default: '',
    validator(value) {
      return !value || ['small', 'large'].includes(value);
    },
  },
});

const rootClass = computed(() => {
  const classs = [];
  if (props.size) classs.push(`sky-button--${props.size}`);
  if (props.plain) classs.push('sky-button--plain');
  return classs;
});
</script>

<style lang="scss" scoped>
.sky-button {
  @apply relative py-2 px-3 text-sm border border-gray-300 rounded;

  &:hover {
    @apply text-blue-700 bg-blue-100 border-blue-300;
  }

  &:active {
    @apply text-blue-900 border-blue-500;
  }

  &--small {
    @apply py-1.5 px-2.5 text-xs;
  }

  &--large {
    @apply py-3 px-4 text-base;
  }

  &--plain {
    @apply p-0 border-none bg-transparent;

    &:hover {
      @apply bg-transparent;
    }
  }
}
</style>
