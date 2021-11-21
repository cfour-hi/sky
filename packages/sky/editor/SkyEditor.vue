<template>
  <div ref="elRoot" class="sky-editor" :style="rootStyle">
    <SkyRenderer ref="elSkyRenderer" :state="sky.state" />
    <ControlPanelContainer class="sky-control-panel" />
  </div>
</template>

<script>
export default {
  name: 'SkyEditor',
};
</script>

<script setup>
import {
  computed,
  inject,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  watchEffect,
  getCurrentInstance,
} from 'vue';
import { isBackgroundElement, isLockCloudElement } from './helper';

const sky = inject('sky');
sky.vm = getCurrentInstance();

const props = defineProps({
  bgStyle: Object,
});

const elSkyRenderer = ref();

const rootStyle = computed(() => ({
  width: `${sky.state.width}px`,
  height: `${sky.state.height}px`,
}));

const elRoot = ref();
onMounted(() => {
  sky.moveable.createInstance(elRoot.value);
  sky.selecto.createInstance(document.querySelector(sky.options.selecto));
  elSkyRenderer.value.$el.addEventListener('mousedown', onMousedownLeft);
});

onBeforeUnmount(() => {
  elSkyRenderer.value.$el.removeEventListener('mousedown', onMousedownLeft);
});

watch(
  [() => sky.state.clouds, () => props.bgStyle],
  () => {
    sky.history.unshift();
  },
  {
    immediate: true,
    deep: true,
  },
);

watchEffect(() => {
  sky.state.bgStyle = props.bgStyle;
});

let mousedownEvent = null;
let mousedownTarget = null;
let mousedownAndMoved = false;

async function mousemove() {
  mousedownAndMoved = true;
  const [target0] = mousedownTarget;

  if (!target0 || isBackgroundElement(target0) || isLockCloudElement(target0)) {
    return;
  }

  await sky.moveable.setTarget(mousedownTarget);
  sky.moveable.instance.dragStart(mousedownEvent); // 触发拖动

  console.log('mmousemove');
}

async function mouseup(event) {
  if (!mousedownAndMoved) {
    document.removeEventListener('mousemove', mousemove);
  }
  if (mousedownAndMoved) {
    mousedownAndMoved = false;
  } else {
    await sky.moveable.setTarget(mousedownTarget);
    sky.cloud.setSelectCloud(event);
  }
  mousedownEvent = null;
  mousedownTarget = null;
}

// 点击左键的时候就需要获取目标图层，但是不选中
// 等到 mousemove or mouseup 的时候再选中
function onMousedownLeft(event) {
  mousedownEvent = event;
  mousedownTarget = sky.moveable.getTarget(event);

  document.addEventListener('mousemove', mousemove, { once: true });
  document.addEventListener('mouseup', mouseup, { once: true });
}

defineExpose({ elSkyRenderer });
</script>

<style scoped>
.sky-editor {
  position: relative;
  background-color: #fff;
  background-size: 16px 16px;
  background-position: 0 0, 8px 8px;
  background-image: linear-gradient(
      to top right,
      #ccc 25%,
      transparent 0,
      transparent 75%,
      #ccc 0,
      #ccc
    ),
    linear-gradient(
      to top right,
      #ccc 25%,
      transparent 0,
      transparent 75%,
      #ccc 0,
      #ccc
    );
  user-select: none;
}
</style>

<style>
.moveable-area,
.sky-cloud-select {
  cursor: move;
}

.border-before {
  content: '';
  display: none;
  box-sizing: initial;
  border: 1px solid #666;
  margin: -1px 0 0 -1px;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  pointer-events: none;
}

.cloud > .border-before {
  content: '';
  display: none;
  box-sizing: initial;
  border: 1px solid #666;
  margin: -1px 0 0 -1px;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  pointer-events: none;
}

.sky-cloud-select > .border-before {
  box-sizing: initial;
  display: block;
  border-color: #4af;
  border-style: solid;
  background-color: initial;
  border-width: 1px;
  margin: -1px 0 0 -1px;
}

.moveable-control-box.lock .moveable-line {
  background: #f84545;
}
</style>
