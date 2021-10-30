<script>
export default {
  name: 'PopupLayer',
};
</script>

<script setup>
import { computed, ref, watch, inject } from 'vue';

const sky = inject('sky');

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const step = ref(0);
const overlappingClouds4Cloud = ref([]);

const layerLength = computed(() => {
  return overlappingClouds4Cloud.value.length;
});

const stepLength = computed(() => {
  return layerLength.value === 0 ? 0 : layerLength.value - 1;
});

watch(
  () => props.visible,
  (value) => {
    if (!value) return;

    const overlappingClouds = sky.cloud.getOverlappingClouds4Cloud();
    const [cloud0, ...clouds] = sky.runtime.targetClouds;
    overlappingClouds4Cloud.value = overlappingClouds.filter(
      (cloud) => !clouds.includes(cloud),
    );
    step.value = overlappingClouds4Cloud.value.findIndex(
      (cloud) => cloud.id === cloud0.id,
    );
  },
);

function handleInputStep(value) {
  if (value > step.value) {
    sky.cloud.moveUp();
  } else {
    sky.cloud.moveDown();
  }
  step.value = value;
}

function handleMoveDown() {
  if (step.value <= 0) return;
  handleInputStep(step.value - 1);
}

function handleMoveUp() {
  if (step.value >= stepLength) {
    return;
  }
  handleInputStep(step.value + 1);
}
</script>

<template>
  <SkyPopup
    class="popup__layer"
    :width="240"
    :visible="visible"
    v-bind="$attrs"
  >
    <div class="title">画布对齐</div>

    <div class="flex justify-between items-center">
      <SkyButton plain @click="$sky.cloud.alignEditorTop">
        <SkyTooltip content="上对齐" direction="bottom" />
        <svg-icon filename="align-top" />
      </SkyButton>

      <SkyButton plain @click="$sky.cloud.alignEditorVerticalMiddle">
        <SkyTooltip content="垂直居中对齐" direction="bottom" />
        <svg-icon filename="align-vertical-middle" />
      </SkyButton>

      <SkyButton plain @click="$sky.cloud.alignEditorBottom">
        <SkyTooltip content="下对齐" direction="bottom" />
        <svg-icon filename="align-bottom" />
      </SkyButton>

      <div class="h-4 w-px bg-gray-300"></div>

      <SkyButton plain @click="$sky.cloud.alignEditorLeft">
        <SkyTooltip content="左对齐" direction="bottom" />
        <svg-icon filename="align-left" />
      </SkyButton>

      <SkyButton plain @click="$sky.cloud.alignEditorHorizontalMiddle">
        <SkyTooltip content="水平居中对齐" direction="bottom" />
        <svg-icon filename="align-horizontal-middle" />
      </SkyButton>

      <SkyButton plain @click="$sky.cloud.alignEditorRight">
        <SkyTooltip content="右对齐" direction="bottom" />
        <svg-icon filename="align-right" />
      </SkyButton>
    </div>

    <div class="title mt-3">图层顺序</div>

    <div class="flex justify-between items-center">
      <SvgIcon filename="layer-down" @click="handleMoveDown" />

      <div class="relative">
        <div v-show="layerLength > 1" class="layer-step">
          <div
            v-for="n in stepLength"
            :key="n"
            :style="{ left: `${(n / stepLength) * 100}%` }"
            class="absolute w-px h-full bg-gray-400"
          ></div>
        </div>

        <SkySlider
          :value="step"
          :max="stepLength"
          :step="1"
          :disabled="stepLength === 0"
          :show-tooltip="false"
          class="w-36"
          @input="handleInputStep"
        />
      </div>

      <SvgIcon filename="layer-up" @click="handleMoveUp" />
    </div>
  </SkyPopup>
</template>

<style lang="scss" scoped>
.layer-step {
  @apply absolute w-full h-1.5 top-0.5;

  &::before {
    content: '';
    @apply absolute w-px h-full bg-gray-400;
  }
}

.title {
  @apply mb-3 text-xs text-gray-400;
}

.svg-icon {
  @apply -mt-1 cursor-pointer;

  &:hover {
    @apply opacity-60;
  }
}
</style>

<style lang="scss">
.popup__layer {
  .sky-slider {
    &__progress {
      @apply invisible;
    }
  }
}
</style>
