<template>
  <SkyPopup :width="240" v-bind="$attrs">
    <div class="flex justify-between items-center text-xs">
      <div>字间距</div>

      <SkySlider
        v-model:value="proxyLetterSpacing"
        :min="minLetterSpacing"
        :max="maxLetterSpacing"
        :show-tooltip="false"
        class="w-28 mx-2"
      />

      <SkyInputNumber
        :value="Math.round(proxyLetterSpacing)"
        size="small"
        class="w-12"
        :min="minLetterSpacing"
        :max="maxLetterSpacing"
        @change="proxyLetterSpacing = $event"
      />
    </div>

    <div class="flex justify-between items-center text-xs mt-2">
      <div>行间距</div>

      <SkySlider
        v-model:value="proxyLineHeight"
        :min="0.5"
        :max="2.5"
        :show-tooltip="false"
        class="w-28 mx-2"
      />

      <SkyInputNumber
        :value="proxyLineHeight"
        :min="0.5"
        :max="2.5"
        :decimal="2"
        :step="0.02"
        size="small"
        class="w-12"
        @change="proxyLineHeight = $event"
      />
    </div>
  </SkyPopup>
</template>

<script>
export default {
  name: 'PopupSpacing',
};
</script>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  letterSpacing: { type: Number, default: 0 },
  lineHeight: { type: Number, default: 1 },
  fontSize: { type: Number, required: true },
});

const emit = defineEmits(['update:letterSpacing', 'update:lineHeight']);

const proxyLetterSpacing = computed({
  get: () => props.letterSpacing,
  set: (value) => {
    emit('update:letterSpacing', value);
  },
});

const proxyLineHeight = computed({
  get: () => props.lineHeight,
  set: (value) => {
    emit('update:lineHeight', value);
  },
});

const minLetterSpacing = computed(() => {
  if (props.fontSize > 50) return -50;
  return -props.fontSize;
});

const maxLetterSpacing = computed(() => {
  if (props.fontSize < 50) return 50;
  return props.fontSize;
});
</script>
