<template>
  <div ref="elRoot" class="cloud-text__editor" :style="rootStyle">
    <CloudText :cloud="cloud" />
  </div>
</template>

<script>
export default {
  name: 'CloudTextEditor',
};
</script>

<script setup>
import { WRITING_MODE } from '@/constants';
import { computed, onMounted, ref, watch, inject } from 'vue';
import CloudText from './index.vue';

const sky = inject('sky');

const props = defineProps({
  cloud: {
    type: Object,
    required: true,
  },
});

// TODO: 组件在 clouds 进入编辑状态，不可触发拖动行为
const RENDER_DIRECTIONS_BASE = ['ne', 'nw', 'sw', 'se'];
const skyHooks = {
  moveable: {
    onClick,
    onChangeTarget,
    onResizeStart,
    onResize,
    keepRatio: [...RENDER_DIRECTIONS_BASE],
    renderDirections: toRenderDirections(props.cloud.writingMode),
    onLeaveSelect: onChangeTarget,
  },
};
let elTextContent = null;
let elTextEffect = null;

const elRoot = ref();
const readonly = ref(true);

const rootStyle = computed(() => ({
  width: `${props.cloud.width / sky.state.scale}px`,
  height: `${props.cloud.height / sky.state.scale}px`,
  transform: `scale(${sky.state.scale})`,
  transformOrigin: 'top left',
}));

watch(readonly, (_readonly) => {
  if (_readonly) {
    // 更新文字内容
    props.cloud.text = elTextContent.textContent;
  } else {
    sky.moveable.instance.passDragArea = true;
    doSelectAll();
  }
  // 编辑状态下不显示特效
  elTextEffect.style.display = _readonly ? 'block' : 'none';
  elTextContent.setAttribute('contenteditable', !_readonly);
});

watch(
  () => props.cloud.writingMode,
  (value) => {
    // 变更可 resize 方向
    skyHooks.moveable.renderDirections = toRenderDirections(value);
    sky.moveable.updateState();
    sky.cloud.updateCloudsElementRect();
  },
);

onMounted(() => {
  elTextContent = elRoot.value.querySelector('.text__content');
  elTextEffect = elRoot.value.querySelector('.text__effect');
});

function toRenderDirections(mode) {
  if (mode === WRITING_MODE.v) {
    return [...RENDER_DIRECTIONS_BASE, 'n', 's'];
  }
  return [...RENDER_DIRECTIONS_BASE, 'w', 'e'];
}

function doSelectAll() {
  window.getSelection().removeAllRanges();
  window.getSelection().selectAllChildren(elTextContent);
}

function onClick(event) {
  if (props.cloud.lock || event.metaKey || event.shiftKey) {
    return;
  }
  readonly.value = false;
}

function onChangeTarget() {
  readonly.value = true;
}

function onResizeStart(event) {
  const { datas } = event;
  datas.startFontSize = props.cloud.fontSize;
  datas.startLetterSpacing = props.cloud.letterSpacing;
}

function onResize(event) {
  const { datas, direction } = event;
  const [h, v] = direction;
  const { el } = sky.cloudVM[props.cloud.id].subTree;

  if (props.cloud.writingMode === WRITING_MODE.h) {
    if (v === 0) {
      // 左右拉伸
      const { clientHeight } = elTextContent;
      el.style.height = `${clientHeight}px`;
      props.cloud.height = clientHeight;
    }
  } else if (props.cloud.writingMode === WRITING_MODE.v) {
    if (h === 0) {
      // 上下拉伸
      const { clientWidth } = elTextContent;
      el.style.width = `${clientWidth}px`;
      props.cloud.width = clientWidth;
    }
  }

  // 对角拉伸
  if (h !== 0 && v !== 0) {
    props.cloud.fontSize = datas.startFontSize * datas.scale[0];
    props.cloud.letterSpacing = datas.startLetterSpacing * datas.scale[0];
    Object.assign(elTextContent.style, {
      fontSize: `${props.cloud.fontSize}px`,
      letterSpacing: `${props.cloud.letterSpacing}px`,
    });
  }
}

defineExpose({ skyHooks, readonly });
</script>

<style src="./editor.css"></style>
