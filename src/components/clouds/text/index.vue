<template>
  <div class="cloud-text">
    <div class="text__effect" v-show="readonly">
      <div
        v-for="(stroke, index) in cloud.strokes"
        :key="`stroke${index}`"
        class="text__stroke"
        :style="toStrokeStyle(stroke)"
      >
        <span
          v-for="(text, index1) in cloud.texts"
          :key="index1"
          :style="toSpanStyle(text)"
          v-text="text.text"
        ></span>
      </div>

      <div
        v-for="(shadow, index) in cloud.shadows"
        :key="`shadow${index}`"
        class="text__shadow"
        :style="toShadowStyle(shadow)"
      >
        <span
          v-for="(text, index1) in cloud.texts"
          :key="index1"
          :style="toSpanStyle(text)"
          v-text="text.text"
        ></span>
      </div>
    </div>

    <div
      class="text__content"
      :style="textContentStyle"
      v-bind="$attrs"
      :contenteditable="!readonly"
    >
      <span
        v-for="(text, index) in cloud.texts"
        :key="index"
        :style="toSpanStyle(text)"
      >
        {{ text.text }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CloudText',
  inheritAttrs: false,
};
</script>

<script setup>
import sky from '@/plugins/sky';
import { computed } from 'vue';

const props = defineProps({
  cloud: {
    type: Object,
    required: true,
  },

  readonly: {
    type: Boolean,
    default: true,
  },
});

const textContentStyle = computed(() => {
  const isVertical = props.cloud.writingMode === 'vertical-rl';
  return {
    ...toStyle(props.cloud),
    width: isVertical ? 'auto' : '100%',
    height: isVertical ? '100%' : 'auto',
  };
});

function toStyle(styles) {
  const result = {
    fontSize: styles.fontSize ? `${styles.fontSize}px` : '',
    textAlign: styles.textAlign ?? '',
    color: styles.color,
    textDecoration: styles.textDecoration ?? '',
    writingMode: styles.writingMode ?? '',
    fontWeight: styles.fontWeight ?? '',
    fontStyle: styles.fontStyle ?? '',
    lineHeight: styles.lineHeight ?? '',
    letterSpacing: styles.letterSpacing ?? '',
  };

  if (styles.fontFamily) {
    result.fontFamily = styles.fontFamily;
  }

  return result;
}

function toSpanStyle(text) {
  return toStyle(text);
}

function toStrokeStyle(stroke) {
  return {
    webkitTextStroke: `${stroke.width}px rgba(${stroke.color.join(',')})`,
  };
}

function toShadowStyle(shadow) {
  const { distance, angle, color, blur } = shadow;
  const x = distance * Math.cos((180 - angle) * (Math.PI / 180));
  const y = distance * Math.sin((180 - angle) * (Math.PI / 180));
  // console.log(`${x}px ${y}px ${blur}px rgba(${color.join(',')})`);

  return {
    textShadow: `${x}px ${y}px ${blur}px rgba(${color.join(',')})`,
  };
}
</script>
