<template>
  <div
    ref="elRoot"
    class="cloud-text__editor"
    :style="rootStyle"
    @click="onClick"
  >
    <CloudText :cloud="cloud" :readonly="readonly" />
  </div>
</template>

<script>
export default {
  name: 'CloudTextEditor',
};
</script>

<script setup>
import { WRITING_MODE } from '@/constants';
import { computed, onMounted, ref, watch, nextTick, inject } from 'vue';
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
let clickTimestamp = null;

const skyHooks = {
  moveable: {
    onClick,
    onChangeTarget,
    onResizeStart,
    onResize,
    onResizeEnd,
    keepRatio: [...RENDER_DIRECTIONS_BASE],
    renderDirections: toRenderDirections(props.cloud.writingMode),
    onLeaveSelect: onChangeTarget,
  },
};

const elRoot = ref();
const readonly = ref(true);
const value = ref(JSON.stringify(props.cloud.texts));
let elTextContent = null;

const rootStyle = computed(() => ({
  width: `${props.cloud.width / sky.state.scale}px`,
  height: `${props.cloud.height / sky.state.scale}px`,
  transform: `scale(${sky.state.scale})`,
  transformOrigin: 'top left',
}));

watch(readonly, (value) => {
  if (!value) {
    sky.moveable.instance.passDragArea = true;
  }
});

watch(
  () => props.cloud.writingMode,
  (value) => {
    skyHooks.moveable.renderDirections = toRenderDirections(value);
    sky.moveable.updateState();
    sky.cloud.updateCloudsElementRect();
  },
);

onMounted(() => {
  elTextContent = elRoot.value.querySelector('.text__content');

  [('cloud.letterSpacing', 'cloud.lineHeight')].forEach((key) => {
    watch(
      () => key,
      async () => {
        await nextTick();

        // TODO:
        // props.cloud.height = this.$refs.slateEditor.$el.clientHeight;
        sky.cloud.updateCloudsElementRect();
      },
    );
  });
});

function toRenderDirections(mode) {
  if (mode === WRITING_MODE.v) {
    return [...RENDER_DIRECTIONS_BASE, 'n', 's'];
  }
  return [...RENDER_DIRECTIONS_BASE, 'w', 'e'];
}

function handleChange() {
  // TODO:
  // props.cloud.texts = this.$editor.children;
}

function doSelectAll() {
  window.getSelection().removeAllRanges();
  window.getSelection().selectAllChildren(elTextContent);
}

function onClick(event) {
  if (!readonly.value || props.cloud.lock || event.metaKey || event.shiftKey) {
    return;
  }
  if (sky.runtime.targetClouds.find((cloud) => cloud.id === props.cloud.id)) {
    readonly.value = false;
    nextTick(() => {
      doSelectAll();
    });
  }
}

function onChangeTarget() {
  readonly.value = true;
  props.cloud.text = elTextContent.textContent;
}

function onResizeStart(event) {
  const { datas } = event;
  datas.startFontSize = props.cloud.fontSize;
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
  }
}

function onResizeEnd() {
  //
}

defineExpose({ skyHooks, readonly });
</script>

<style src="./editor.css"></style>
