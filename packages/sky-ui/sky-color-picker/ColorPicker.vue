<template>
  <div class="sky-color-picker">
    <div class="mb-3">{{ mode }}</div>

    <SkyTabs
      v-if="modes.length > 1"
      :value="mode"
      @change="emit('changeMode', $event)"
    >
      <SkyTabPanel v-for="label in modes" :key="label" :label="label">
      </SkyTabPanel>
    </SkyTabs>

    <template v-if="showGradient">
      <div v-show="mode === '渐变'" class="sky-cp__gradient flex-center">
        <div class="sky-cp__gradient-bar w-48 h-4">
          <div
            ref="elGradientTrack"
            class="sky-cpgb__track h-full"
            style="width: 174px"
            :style="{ background: value }"
          >
            <!-- tabindex="-1" 是元素可以触发 keydown 事件 -->
            <div
              v-for="(gradient, index) in gradients"
              :key="index"
              class="sky-cpgb__pointer"
              :class="{
                'sky-cpgb__pointer--active': gradient === activeGradient,
              }"
              :data-sort="index"
              :style="{
                left: `${gradient.offset * 100}%`,
                background: gradient.color,
              }"
              tabindex="-1"
              @mousedown="handleMousedownGradientPointer(gradient)"
              @keyup.stop="handleKeyupGradientPointer"
            ></div>
          </div>
        </div>
      </div>
    </template>

    <div
      ref="elPalette"
      class="sky-cp__palette"
      :style="{ background: paletteBackground }"
    >
      <div class="sky-cpp__color-saturation"></div>
      <div class="sky-cpp__color-value"></div>
      <div ref="elPalettePointer" class="sky-cpp__pointer"></div>
    </div>

    <div class="sky-cp__slider sky-cp__slider-hux">
      <div ref="elSliderHux" class="sky-cps__track">
        <div ref="elSliderHuxPointer" class="sky-cpst__pointer"></div>
      </div>
    </div>

    <div class="sky-cp__slider sky-cp__slider-alpha">
      <div
        class="sky-cpsa__background"
        :style="sliderAlphaBackgroundStyle"
      ></div>
      <div ref="elSliderAlpha" class="sky-cps__track">
        <div ref="elSliderAlphaPointer" class="sky-cpst__pointer"></div>
      </div>
    </div>

    <div class="flex justify-between mt-3.5">
      <SkyButton size="small" @click="handleClickStraw">
        <svg-icon filename="straw" />
      </SkyButton>

      <SkyInput
        :value="hex"
        class="w-24 mx-1"
        size="small"
        @change="handleChangeHex"
      />

      <SkyInputNumber
        v-model:value="alpha"
        class="w-12"
        size="small"
        :min="0"
        :max="100"
        @input="handleChangeAlpha"
        @change="handleChangeAlpha"
      />
    </div>
  </div>

  <teleport to="body">
    <div v-if="picking" class="sky-cp__picking-model">
      <canvas class="sky-cp__straw-canvas" @click="handleChangeColor"></canvas>
      <div class="sky-cp__straw-mousetrack"></div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: 'ColorPicker',
  inheritAttrs: false,
};
</script>

<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  nextTick,
  onBeforeUnmount,
} from 'vue';
import { registerMoveableElement } from '../moveable';
import {
  hexA2HSLA,
  HSLA2HexA,
  hex2RGB,
  RGB2HSL,
  hexA2RGBA,
  RGBA2HexA,
} from '../color';
import { toGradientString, dom2Image } from './helper';

const props = defineProps({
  value: {
    type: String,
    default: '#ffffff00',
  },

  modes: {
    type: Array,
    default: () => ['纯色', '渐变', '图案'],
  },

  mode: {
    type: String,
    default: '纯色',
    validator: (value) => ['纯色', '渐变', '图案'].includes(value),
  },

  strawEl: {
    type: HTMLElement,
    default: document.body,
  },

  strawCss: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:value', 'changeMode']);

const angle = ref(90);
const gradients = ref([]);
const hsla = reactive({ h: 0, s: 0, l: 0, a: 0 });
const paletteBackground = ref('#f00');
const hex = ref('#000');
const alpha = ref(0);
const picking = ref(false);
let activeGradient = ref({});

const elGradientTrack = ref(null);
const elPalette = ref(null);
const elPalettePointer = ref(null);
const elSliderHuxPointer = ref(null);
const elSliderHux = ref(null);
const elSliderAlphaPointer = ref(null);
const elSliderAlpha = ref(null);
const elStrawCanvas = ref(null);

let gradientMoveable = null;
let paletteMoveable = null;
let sliderHuxMoveable = null;
let sliderAlphaMoveable = null;
let mousedownGradientPointer = null;
let backendHex = null;
let unwatchHSLA = null;

const showGradient = computed(() => {
  return props.modes.includes('渐变');
});

const sliderAlphaBackgroundStyle = computed(() => {
  const rgb = hex2RGB(hex.value).join(',');
  return {
    background: `linear-gradient(to right, rgba(${rgb}, 0) 0%, rgb(${rgb}) 100%)`,
  };
});

watch(
  () => props.mode,
  (value) => {
    changeMode(value);
  },
);

watch(activeGradient, (value) => {
  setColor(value.color);
});

onMounted(async () => {
  changeMode(props.mode);

  elPalettePointer.value.style.left = `${hsla.s}%`;
  elPalettePointer.value.style.top = `${100 - hsla.l}%`;
  elSliderHuxPointer.value.style.left = `${(hsla.h / 360) * 100}%`;
  elSliderAlphaPointer.value.style.left = `${hsla.a * 100}%`;

  if (showGradient.value) {
    gradientMoveable = registerMoveableElement(elGradientTrack.value, {
      onmousedown: onMousedownGradient,
      onmousemove: onMousemoveGradient,
      onmouseup: onMouseupGradient,
    });
  }

  paletteMoveable = registerMoveableElement(elPalette.value, {
    onmousemove: onChangeSL,
    onmouseup: onChangeSL,
  });

  sliderHuxMoveable = registerMoveableElement(elSliderHux.value, {
    onmousemove: onChangeHux,
    onmouseup: onChangeHux,
  });

  sliderAlphaMoveable = registerMoveableElement(elSliderAlpha.value, {
    onmousemove: onChangeAlpha,
    onmouseup: onChangeAlpha,
  });

  await nextTick();

  unwatchHSLA = watch(hsla, onChangeHSLA, { deep: true });
});

onBeforeUnmount(() => {
  paletteMoveable?.destroy();
  sliderHuxMoveable?.destroy();
  sliderAlphaMoveable?.destroy();
  unwatchHSLA();

  if (gradientMoveable) {
    gradientMoveable.destroy();
  }
});

function changeMode(mode) {
  if (mode === '渐变') {
    if (gradients.value.length === 0) {
      props.value.match(/[^,]+/g).forEach((item, index) => {
        if (index === 0) {
          angle.value = Number(item.match(/\d+/)[0]);
          return;
        }

        let [color, offset] = item.trim().split(' ');
        if (!color.startsWith('#')) color = RGBA2HexA(color);

        offset = offset.match(/\d+/)[0] / 100;

        gradients.value.push({ color, offset });
        activeGradient.value = gradients.value[0];
      });
    } else {
      setColor(activeGradient.value.color);
    }
  } else if (mode === '纯色') {
    setColor(props.value);
  }

  // TODO: 图案
}

function updateColorData(hexA) {
  paletteBackground.value = `hsl(${hsla.h}, 100%, 50%)`;
  hex.value = hexA.slice(0, 7);
  backendHex = hex.value;
  alpha.value = Math.round((hsla.a ?? 1) * 100);
}

function setColor(color) {
  const _hsla = hexA2HSLA(color);
  hsla.h = _hsla[0];
  hsla.s = _hsla[1];
  hsla.l = _hsla[2];
  hsla.a = _hsla[3];

  updateColorData(color);

  let x = hsla.s;
  const y = Math.round(100 - hsla.l);
  elPalettePointer.value.style.left = `${x}%`;
  elPalettePointer.value.style.top = `${y}%`;

  x = hsla.h / 360;
  elSliderHuxPointer.value.style.left = `${x * 100}%`;

  elSliderAlphaPointer.value.style.left = `${hsla.a * 100}%`;
}

function onMousedownGradient(position) {
  if (mousedownGradientPointer) {
    return;
  }

  const index = gradients.value.findIndex((stop) => stop.offset >= position.x);
  const start = gradients.value[index - 1];
  const startRGBA = hexA2RGBA(start.color);
  const end = gradients.value[index];
  const endRGBA = hexA2RGBA(end.color);

  const rgb = [];
  for (let i = 0; i < 3; i += 1) {
    rgb.push(startRGBA[i] + (endRGBA[i] - startRGBA[i]) * position.x);
  }

  const a =
    end.offset - position.x - (position.x - start.offset) > 0
      ? startRGBA[3]
      : endRGBA[3];

  const color = RGBA2HexA(...rgb, a);
  activeGradient.value = {
    color,
    offset: position.x,
  };

  gradients.value.splice(index, 0, activeGradient.value);
}

function onMousemoveGradient(position) {
  if (!mousedownGradientPointer) return;

  activeGradient.value.offset = position.x;
  gradients.value.sort((a, b) => a.offset - b.offset);

  emit('update:value', toGradientString(angle.value, gradients.value));
}

function onMouseupGradient() {
  mousedownGradientPointer = false;
}

function handleMousedownGradientPointer(stop) {
  mousedownGradientPointer = true;
  activeGradient.value = stop;
}

function handleKeyupGradientPointer(event) {
  if (!['Backspace', 'Delete'].includes(event.key)) return;
  if (gradients.value.length === 2) return;

  const index = gradients.value.indexOf(activeGradient.value);
  gradients.value.splice(index, 1);
  activeGradient.value = gradients.value[0];
}

function onChangeHSLA(hsla) {
  const hexA = HSLA2HexA(...Object.values(hsla));

  if (props.mode === '纯色') {
    emit('update:value', hexA);
  } else if (props.mode === '渐变') {
    activeGradient.value.color = hexA;
    emit('update:value', toGradientString(angle.value, gradients.value));
  }
  updateColorData(hexA);
}

function onChangeSL(position) {
  const x = position.x * 100;
  const y = position.y * 100;

  hsla.s = Math.round(x);
  hsla.l = Math.round(100 - y);

  elPalettePointer.value.style.left = `${x}%`;
  elPalettePointer.value.style.top = `${y}%`;
}

function onChangeHux(position) {
  hsla.h = position.x * 360;
  elSliderHuxPointer.value.style.left = `${position.x * 100}%`;
}

function onChangeAlpha(position) {
  hsla.a = position.x;
  elSliderAlphaPointer.value.style.left = `${position.x * 100}%`;
}

function handleChangeHex(value) {
  if (/^#(?:[0-9a-f]{3}){1,2}$/i.test(value)) {
    const rgb = hex2RGB(value);
    const [h, s, l] = RGB2HSL(...rgb);
    hsla.h = h;
    hsla.s = s;
    hsla.l = l;

    elPalettePointer.value.style.left = `${hsla.s}%`;
    elPalettePointer.value.style.top = `${100 - hsla.l}%`;
    elSliderHuxPointer.value.style.left = `${(hsla.h / 360) * 100}%`;

    hex.value = value;
  } else {
    hex.value = backendHex;
  }
}

function handleChangeAlpha(value) {
  hsla.a = value / 100;
  elSliderAlphaPointer.value.style.left = `${value}%`;
}

async function handleClickStraw() {
  const img = await dom2Image(props.strawEl, { css: props.strawCss });

  picking.value = true;
  await nextTick();

  const elStrawCanvas = document.querySelector('.sky-cp__straw-canvas');
  const ctx = elStrawCanvas.getContext('2d');
  const { top, left } = props.strawEl.getBoundingClientRect();
  ctx.drawImage(
    img,
    left,
    top,
    props.strawEl.clientWidth,
    props.strawEl.clientHeight,
  );
}

function handleChangeColor() {
  picking.value = false;
  setColor();
}
</script>

<style lang="scss" scoped>
.sky-color-picker {
  @apply select-none;
}

.sky-cp__gradient {
  &-bar {
    @apply flex justify-center;
  }
}

.sky-cpgb__track {
  @apply relative;
}

.sky-cpgb__pointer {
  @apply absolute h-5 -top-0.5 border-2 border-solid border-white transform -translate-x-2/4 shadow outline-none;

  width: 18px;

  &--active {
    z-index: 1;
    box-shadow: 0 0 4px 0 rgb(0 0 0 / 20%), 0 0 0 1.2px #2254f4;
  }
}

.sky-cp__palette {
  height: 140px;
  @apply relative rounded mt-3.5 cursor-pointer overflow-hidden;

  .sky-cpp__color-saturation,
  .sky-cpp__color-value {
    @apply absolute top-0 right-0 bottom-0 left-0;
  }

  .sky-cpp__color-saturation {
    @apply bg-gradient-to-r from-white to-transparent;
  }

  .sky-cpp__color-value {
    @apply bg-gradient-to-t from-black to-transparent;
  }

  .sky-cpp__pointer {
    @apply absolute w-3 h-3 rounded-full border-2 border-white shadow transform -translate-x-1.5 -translate-y-1.5;
  }
}

.sky-cp__slider {
  @apply relative h-2 mt-3.5 rounded cursor-pointer;

  &-hux {
    background: linear-gradient(
      90deg,
      red 0,
      #ff0 17%,
      #0f0 33%,
      #0ff 50%,
      #00f 67%,
      #f0f 83%,
      red
    );
  }

  &-alpha {
    background: linear-gradient(
        to top right,
        hsla(0, 0%, 80%, 0.4) 25%,
        transparent 0,
        transparent 75%,
        hsla(0, 0%, 80%, 0.4) 0,
        hsla(0, 0%, 80%, 0.4)
      ),
      linear-gradient(
        to top right,
        hsla(0, 0%, 80%, 0.4) 25%,
        transparent 0,
        transparent 75%,
        hsla(0, 0%, 80%, 0.4) 0,
        hsla(0, 0%, 80%, 0.4)
      );
    background-size: 6px 6px;
    background-position: 0 0, 3px 3px;
  }

  .sky-cpsa__background {
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 6%);
    @apply h-full rounded;
  }
}

.sky-cps__track {
  @apply absolute top-0 left-1 right-1 h-full;
}

.sky-cpst__pointer {
  box-shadow: 0 0 2px rgb(0 0 0 / 60%);
  @apply box-content absolute top-0 w-2 h-2 border-4 border-white rounded-full transform -translate-x-2 -translate-y-1;
}

.sky-cp__picking-model {
  z-index: 3001;
  @apply fixed top-0 left-0 w-full h-full;

  .sky-cp__straw-canvas {
    @apply w-full h-full;
  }

  .sky-cp__straw-mousetrack {
    @apply fixed;
  }
}
</style>
