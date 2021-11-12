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

  <SkyDialog
    v-model:visible="showGenerateImageProgress"
    width="600px"
    height="360px"
    class="generate-process"
    @afterClose="handleAfterClose"
  >
    <SkyProgress
      :percent="generateImageProgressPercent"
      type="Circle"
      :options="generateImageOptions"
    />

    <a target="_blank" class="block mt-4" :href="generateImageBlobURL">{{
      generateImageBlobURL
    }}</a>
  </SkyDialog>
</template>

<script setup>
import { inject, nextTick, ref, reactive } from 'vue';
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

const showGenerateImageProgress = ref(false);
const generateImageProgressPercent = ref(0);
const generateImageBlobURL = ref('');
const generateImageOptions = reactive({
  strokeWidth: 4,
  trailWidth: 4,
  svgStyle: {
    display: 'block',
    width: '200px',
  },
});

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
  showGenerateImageProgress.value = true;

  console.time('handleGenerateImage');

  const blob = await generateImage({
    onProgress: (percent) => {
      if (showGenerateImageProgress.value) {
        generateImageProgressPercent.value = percent;
      }
    },
  });

  console.timeEnd('handleGenerateImage');

  generateImageBlobURL.value = URL.createObjectURL(blob);
  console.log(generateImageBlobURL.value);
  // window.open(generateImageBlobURL.value);
  // URL.revokeObjectURL(generateImageBlobURL.value);
}

function handleAfterClose() {
  showGenerateImageProgress.value = false;
  generateImageBlobURL.value = '';
  generateImageProgressPercent.value = 0;
}
</script>

<style lang="scss" scoped>
.app-header {
  height: var(--app-header-height);
  background: #fff;
}
</style>

<style lang="scss">
.generate-process {
  .sky-dialog__body {
    @apply text-center;
  }
}
</style>
