<template>
  <div class="cloud-text">
    <div class="text__effect">
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
      ref="elTextContent"
      class="text__content"
      :style="textContentStyle"
      v-bind="$attrs"
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
import { computed, onMounted, ref } from 'vue';
import { WRITING_MODE } from '@/constants';

const props = defineProps({
  cloud: {
    type: Object,
    required: true,
  },
});

const elTextContent = ref();

const textContentStyle = computed(() => {
  // 以下属性都不会影响图层尺寸，可以异步更新
  const styles = {
    fontWeight: props.cloud.fontWeight,
    fontStyle: props.cloud.fontStyle,
    textDecoration: props.cloud.textDecoration,
    textAlign: props.cloud.textAlign,
    color: props.cloud.color,
    writingMode: props.cloud.writingMode,
    fontFamily: props.cloud.fontFamily,
  };

  const isVertical = props.cloud.writingMode === WRITING_MODE.v;
  return {
    ...styles,
    width: isVertical ? 'auto' : '100%',
    height: isVertical ? '100%' : 'auto',
  };
});

onMounted(() => {
  // 以下属性都会影响图层尺寸，要求同步更新
  Object.assign(elTextContent.value.style, {
    fontSize: `${props.cloud.fontSize}px`,
    lineHeight: props.cloud.lineHeight,
    letterSpacing: `${props.cloud.letterSpacing}px`,
  });
});

function toSpanStyle(text) {
  const result = {
    fontSize: text.fontSize ? `${text.fontSize}px` : '',
    textAlign: text.textAlign ?? '',
    color: text.color,
    textDecoration: text.textDecoration ?? '',
    writingMode: text.writingMode ?? '',
    fontWeight: text.fontWeight ?? '',
    fontStyle: text.fontStyle ?? '',
    lineHeight: text.lineHeight ?? '',
    letterSpacing: text.letterSpacing ? `${text.letterSpacing}px` : '',
  };
  if (text.fontFamily) {
    result.fontFamily = text.fontFamily;
  }
  return result;
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
