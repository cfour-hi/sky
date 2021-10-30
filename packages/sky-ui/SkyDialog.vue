<script>
export default {
  name: 'SkyDialog',
};
</script>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  width: {
    type: String,
    default: '80%',
  },

  height: {
    type: String,
    default: '80%',
  },
});

const emit = defineEmits(['update:visible']);

const rootStyle = computed(() => {
  return {
    display: props.visible ? 'flex' : 'none',
  };
});

const panelStyle = computed(() => {
  return {
    width: props.width,
    height: props.height,
  };
});

function handleClickMask() {
  emit('update:visible', false);
}
</script>

<template>
  <div class="sky-dialog flex-center" :style="rootStyle">
    <div class="mask" @click="handleClickMask"></div>

    <div class="sky-dialog__panel" :style="panelStyle">
      <div class="sky-dialog__header">
        <slot name="header" />
      </div>

      <div class="sky-dialog__body">
        <slot />
      </div>

      <div class="sky-dialog__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sky-dialog {
  z-index: 3002;
  @apply fixed top-0 right-0 bottom-0 left-0;

  &__panel {
    @apply relative flex flex-col w-4/5 h-4/5 rounded-lg bg-white;
  }

  &__header {
    @apply flex-none h-14;
  }

  &__body {
    @apply flex-1 overflow-auto;
  }

  &__footer {
    @apply flex-none h-14;
  }
}

.mask {
  @apply absolute w-full h-full bg-black bg-opacity-60;
}
</style>
