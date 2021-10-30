<script>
export default {
  name: 'ControlPanelCloudImage',
};
</script>

<script setup>
import ControlPanelHeader from '@/components/control-panel/Header.vue';
import { getCurrentInstance } from 'vue';

const vm = getCurrentInstance();

function handleChange(e) {
  const url = URL.createObjectURL(e.target.files[0]);
  sky.runtime.targetClouds.forEach((cloud) => {
    cloud.src = url;
  });
}
</script>

<template>
  <div class="control-panel__cloud-image">
    <ControlPanelHeader title="图片" />

    <div class="body">
      <SkyButton>替换图片</SkyButton>
    </div>
  </div>
</template>
