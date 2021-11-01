<template>
  <div class="app-header">
    <input type="file" @change="handleChange" />
    <SkyButton @click="handleHistoryBack">Back</SkyButton>
    <SkyButton @click="handleHistoryForward">Forward</SkyButton>
    <SkyButton @click="handleViewportSub">viewport-</SkyButton>
    <SkyButton @click="handleViewport1">{{ sky.state.scale }}</SkyButton>
    <SkyButton @click="handleViewportPlus">viewport+</SkyButton>
    <SkyButton @click="handleSave">Save</SkyButton>
    <SkyButton @click="handleAdaptive">Adaptive</SkyButton>
    <SkyButton @click="handleAddText">Add Text</SkyButton>
    <SkyButton @click="handleAddImage">Add Image</SkyButton>
    <SkyButton @click="handleGenerateImage">Generate Image</SkyButton>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { processPSD2Sky } from '@/plugins/psd';
import { saveTemplate2Local } from '@/plugins/template';
import { adaptiveZoom } from '@/utils/zoom';
import { dom2Svg, svg2ImageBlob } from '@/utils/dom-2-image';
import createTextCloud from '@/components/clouds/text/create';
import createImageCloud from '@/components/clouds/image/create';

const sky = inject('sky');

async function handleChange(e) {
  const data = await processPSD2Sky(e.target.files[0]);
  const clouds = data.clouds.map((cloud) => sky.cloud.create(cloud));

  sky.setState({ ...data, clouds, scale: 1 });

  handleAdaptive();
}

function handleAdaptive() {
  sky.setState({
    scale: adaptiveZoom(
      sky.state.width / sky.state.scale,
      sky.state.height / sky.state.scale,
    ),
  });
}

function handleHistoryBack() {
  sky.history.back();
}

function handleHistoryForward() {
  sky.history.forward();
}

function handleViewportSub() {
  sky.setState({ scale: (Math.round(sky.state.scale * 100) - 5) / 100 });
}

function handleViewport1() {
  sky.setState({ scale: 1 });
}

function handleViewportPlus() {
  sky.setState({ scale: (Math.round(sky.state.scale * 100) + 5) / 100 });
}

function handleSave() {
  saveTemplate2Local(sky.state);
}

function handleAddText() {
  sky.cloud.push(sky.cloud.create(createTextCloud()));
}

function handleAddImage() {
  sky.cloud.push(sky.cloud.create(createImageCloud()));
}

async function handleGenerateImage() {
  console.time('handleGenerateImage');

  const svg = dom2Svg(sky.vm.subTree.el.querySelector('.sky-renderer'));
  const blob = await svg2ImageBlob(svg);

  console.timeEnd('handleGenerateImage');

  // downloadBlob(blob);

  const blobURL = URL.createObjectURL(blob);
  window.open(blobURL);
  URL.revokeObjectURL(blobURL);
}
</script>

<style lang="scss" scoped>
.app-header {
  height: var(--app-header-height);
  background: #fff;
}
</style>
