<template>
  <div class="control-panel__group">
    <ControlPanelHeader title="组合" />

    <div class="body">
      <SkyButton class="button__group" @click="handleClick">
        {{ isClouds ? '拆分' : '成' }}组
      </SkyButton>

      <div class="bar bar-tool mt-3">
        <SkyButton plain @click="sky.cloud.alignTop">
          <SkyTooltip content="上对齐" direction="bottom" />
          <svg-icon filename="align-top" />
        </SkyButton>

        <SkyButton plain @click="sky.cloud.alignVerticalMiddle">
          <SkyTooltip content="垂直居中对齐" direction="bottom" />
          <svg-icon filename="align-vertical-middle" />
        </SkyButton>

        <SkyButton plain @click="sky.cloud.alignBottom">
          <SkyTooltip content="下对齐" direction="bottom" />
          <svg-icon filename="align-bottom" />
        </SkyButton>

        <div class="h-4 w-px bg-gray-300"></div>

        <SkyButton plain @click="sky.cloud.alignLeft">
          <SkyTooltip content="左对齐" direction="bottom" />
          <svg-icon filename="align-left" />
        </SkyButton>

        <SkyButton plain @click="sky.cloud.alignHorizontalMiddle">
          <SkyTooltip content="水平居中对齐" direction="bottom" />
          <svg-icon filename="align-horizontal-middle" />
        </SkyButton>

        <SkyButton plain @click="sky.cloud.alignRight">
          <SkyTooltip content="右对齐" direction="bottom" />
          <svg-icon filename="align-right" />
        </SkyButton>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlPanelGroup',
};
</script>

<script setup>
import { computed, inject } from 'vue';
import ControlPanelHeader from '@/components/control-panel/Header.vue';

const sky = inject('sky');

const isClouds = computed(
  () =>
    sky.runtime.targetClouds.length === 1 &&
    sky.runtime.targetClouds[0]?.type === 'clouds',
);

function handleClick() {
  if (isClouds.value) {
    sky.cloud.unGroup();
  } else {
    sky.cloud.toGroup();
  }
}
</script>

<style lang="scss" scoped>
.button__group {
  @apply w-full bg-blue-50 border-blue-200 text-blue-700 font-bold;
}
</style>
