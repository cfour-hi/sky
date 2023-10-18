<template>
  <OnClickOutside
    v-show="visible"
    class="sky-popup"
    :style="rootStyle"
    @trigger="emit('update:visible', false)"
  >
    <slot />
  </OnClickOutside>
</template>

<script>
import mixinPopup from './mixins/popup';

export default {
  name: 'SkyPopup',
  mixins: [mixinPopup],
};
</script>

<script setup>
import { computed } from 'vue';
import { OnClickOutside } from '@vueuse/components';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  width: {
    type: Number,
    default: 200,
  },
});

const emit = defineEmits(['update:visible']);

const rootStyle = computed(() => {
  return {
    width: `${props.width}px`,
  };
});
</script>

<style lang="scss" scoped>
.sky-popup {
  z-index: 3002;
  transform: translateX(-50%);
  @apply fixed p-3 rounded bg-white shadow;
}
</style>
