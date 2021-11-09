<template>
  <div class="app-header">
    <input type="file" @change="handleChange" />
    <SkyButton @click="handlePSD">PSD</SkyButton>
    <!-- <SkyButton @click="handleHistoryBack">Back</SkyButton> -->
    <!-- <SkyButton @click="handleHistoryForward">Forward</SkyButton> -->
    <SkyButton @click="handleViewportSub">viewport-</SkyButton>
    <SkyButton @click="handleViewport1">{{ sky.state.scale }}</SkyButton>
    <SkyButton @click="handleViewportPlus">viewport+</SkyButton>
    <SkyButton @click="handleAdaptive">Adaptive</SkyButton>
    <SkyButton @click="handleSave">Save</SkyButton>
    <SkyButton @click="handleAddText">Add Text</SkyButton>
    <SkyButton @click="handleAddImage">Add Image</SkyButton>
    <SkyButton @click="handleGenerateImage">Generate Image</SkyButton>
  </div>
</template>

<script setup>
import { inject, nextTick } from 'vue';
import { processPSD2Sky } from '@/plugins/psd';
import { saveTemplate2Local } from '@/plugins/template';
import { adaptiveZoom } from '@/utils/zoom';
import { generateImage } from '@/utils/dom-2-image';
import createTextCloud from '@/components/clouds/text/create';
import createImageCloud from '@/components/clouds/image/create';
import { CLOUD_TYPE } from '@/constants';
import { useFontStore } from '@/stores/font';
import { DEFAULT_FONT_FAMILY } from '@/constants/index';

const sky = inject('sky');
const fontStore = useFontStore();

async function loadPSD(file) {
  const data = await processPSD2Sky(file);
  const clouds = data.clouds.map((cloud) => sky.cloud.create(cloud));
  clouds
    .filter((cloud) => cloud.type === CLOUD_TYPE.text)
    .forEach((cloud) => {
      const font = fontStore.list.find(
        (font) => font.name === cloud.fontFamily,
      );
      if (!font) {
        cloud.fontFamily = DEFAULT_FONT_FAMILY;
      }
    });

  sky.setState({ ...data, clouds, scale: 1 });

  await nextTick();
  handleAdaptive();
}

async function handlePSD() {
  const response = await fetch('odyssey-demo.psd');
  const blob = await response.blob();
  const file = new File([blob], 'odyssey-demo.psd');
  await loadPSD(file);
}

async function handleChange(e) {
  await loadPSD(e.target.files[0]);
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

  const blob = await generateImage();

  console.timeEnd('handleGenerateImage');

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
