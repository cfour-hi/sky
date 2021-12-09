<template>
  <div class="sky-select" data-sky-popup>
    <div @click="onClick">
      <SkyInput :value="value" readonly />

      <!-- 避免 focus 到 input -->
      <div class="absolute w-full h-full top-0 cursor-pointer"></div>

      <div class="sky-select__arrow flex-center">
        <svg-icon filename="arrow-down--line" />
      </div>
    </div>

    <SkyPopup
      v-if="hasLoadOption"
      v-model:visible="showPopup"
      class="sky-select__popup"
    >
      <slot />
    </SkyPopup>
  </div>
</template>

<script>
export default {
  name: 'SkySelect',
};
</script>

<script setup>
import { getCurrentInstance, nextTick, provide, ref } from 'vue';

const vmSelect = provide('vmSelect', getCurrentInstance());

const props = defineProps({
  value: {
    type: [String, Number],
    required: true,
  },

  // 延迟（初始化不）渲染 options DOM
  lazyOption: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:value', 'change']);

const showPopup = ref(false);
const hasLoadOption = ref(!props.lazyOption);

function onClick() {
  hasLoadOption.value = true;
  nextTick(() => {
    showPopup.value = !showPopup.value;
  });
}

function handleChange(value) {
  emit('update:value', value);
  emit('change', value);
  showPopup.value = false;
}

defineExpose({ handleChange });
</script>

<style lang="scss" scoped>
.sky-select {
  @apply relative;

  &__arrow {
    @apply absolute top-0 right-0 bottom-0 w-6 text-lg text-gray-300 cursor-pointer;
  }

  :deep .sky-input__inner {
    @apply pr-6;

    &:read-only {
      @apply select-none;
    }
  }

  &__popup {
    @apply max-h-80 overflow-auto;
  }
}
</style>
