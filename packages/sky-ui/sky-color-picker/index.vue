<template>
  <ColorPicker
    :mode="mode"
    v-bind="$attrs"
    @update:value="handleInput"
    @changeMode="handleChangeMode"
  />
</template>

<script>
export default {
  name: 'SkyColorPicker',
  inheritAttrs: false,
};
</script>

<script setup>
import { ref, watchEffect } from 'vue';
import ColorPicker from './ColorPicker.vue';
import { parseBackgroundValue } from './helper';

const props = defineProps({
  defaultColor: {
    type: String,
    default: '#ffffffff',
  },

  defaultGradient: {
    type: String,
    default: 'linear-gradient(90deg, #fffae0ff 0%, #ffd1f1ff 100%)',
  },

  defaultImage: {
    type: String,
    default:
      'https://st0.dancf.com/csc/157/material-2d-textures/0/20190714-174653-ed3c.jpg',
  },
});
const emit = defineEmits(['update:value']);

const mode = ref('纯色');
const color = ref(props.defaultColor);
const gradient = ref(props.defaultGradient);
const image = ref(props.defaultImage);

watchEffect(
  () => props.value,
  (value) => {
    if (!value) {
      return;
    }
    mode.value = parseBackgroundValue(value);
    handleInput(value);
  },
);

function handleInput(value) {
  if (mode.value === '纯色') {
    color.value = value;
  } else if (mode.value === '渐变') {
    gradient.value = value;
  } else if (mode.value === '图案') {
    image.value = value;
  }
  emit('update:value', value);
}

function handleChangeMode(value) {
  mode.value = value;

  let background;
  if (value === '纯色') {
    background = color.value;
  } else if (value === '渐变') {
    background = gradient.value;
  } else if (value === '图案') {
    background = image.value;
  }
  emit('update:value', background);
}
</script>
