<template>
  <div class="sky-option" :class="rootClass" @click="handleClick">
    <template v-if="$slots.default">
      <slot />
    </template>

    <span v-else>
      {{ label }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'SkyOption',
  inheritAttrs: false,
};
</script>

<script setup>
import { computed, inject } from 'vue';

const vmSelect = inject('vmSelect');

const props = defineProps({
  label: {
    type: String,
    default: '',
  },

  value: {
    required: true,
  },
});

const rootClass = computed(() => {
  return {
    active: props.value === vmSelect.props.value,
  };
});

function handleClick() {
  vmSelect.exposed.handleChange(props.value);
}
</script>

<style lang="scss" scoped>
.sky-option {
  @apply py-1.5 px-3 text-blue-700 cursor-pointer;

  &.active {
    @apply bg-gray-100;
  }

  &:hover {
    @apply bg-gray-100;
  }
}
</style>
