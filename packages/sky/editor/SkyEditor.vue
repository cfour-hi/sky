<template>
  <div ref="elRoot" class="sky-editor" :style="rootStyle">
    <SkyRenderer
      ref="elSkyRenderer"
      :background="sky.state.background"
      :clouds="sky.state.clouds"
      :scale="sky.state.scale"
      @mousedown="handleMousedownLeft"
    />

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
  ref,
  watch,
  getCurrentInstance,
} from 'vue';
import { isBackgroundElement, isLockCloudElement } from './helper';

const sky = inject('sky');
sky.vm = getCurrentInstance();

const elRoot = ref(null);
const elSkyRenderer = ref(null);

let mousedownEvent = null;
let mousedownTarget = null;
let mousedownAndMoved = false;

const rootStyle = computed(() => ({
  width: `${sky.state.width}px`,
  height: `${sky.state.height}px`,
}));

onMounted(() => {
  sky.moveable.createInstance(elRoot.value);
});

watch(
  [() => sky.state.clouds, () => sky.state.background],
  () => {
    sky.history.unshift();
  },
  {
    immediate: true,
    deep: true,
  },
);

async function mousemove() {
  mousedownAndMoved = true;
  const [target0] = mousedownTarget;

  if (!target0 || isBackgroundElement(target0) || isLockCloudElement(target0)) {
    return;
  }

  await sky.moveable.setTarget(mousedownTarget);

  console.log('mousedownEvent', mousedownEvent);
  sky.moveable.instance.dragStart(mousedownEvent);
}

async function mouseup(event) {
  document.removeEventListener('mousemove', mousemove);
  document.removeEventListener('mouseup', mouseup);

  if (mousedownAndMoved) {
    mousedownAndMoved = false;
  } else {
    await sky.moveable.setTarget(mousedownTarget);
    sky.cloud.setSelectCloud(event);
  }

  mousedownEvent = null;
  mousedownTarget = null;
}

function handleMousedownLeft(event) {
  mousedownEvent = event;
  mousedownTarget = sky.moveable.getTarget(event);

  document.addEventListener('mousemove', mousemove);
  document.addEventListener('mouseup', mouseup);
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
