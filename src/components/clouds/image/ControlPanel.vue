<template>
  <div class="control-panel__cloud-image">
    <ControlPanelHeader title="图片" />

    <div class="body">
      <SkyButton @click="onClickReplaceImage">替换图片</SkyButton>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlPanelCloudImage',
};
</script>

<script setup>
import ControlPanelHeader from '@/components/control-panel/Header.vue';
import { blob2B64 } from '@/utils/dataer';
import { getCurrentInstance } from 'vue';

const vm = getCurrentInstance();

function onClickReplaceImage() {
  const elInput = document.createElement('input');
  elInput.type = 'file';
  elInput.click();

  elInput.onchange = async (e) => {
    const base64 = await blob2B64(e.target.files[0]);
    sky.runtime.targetClouds.forEach((cloud) => {
      cloud.src = base64;
      elInput.remove();
    });
  };
}
</script>
