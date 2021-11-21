<template>
  <AppHeader />
  <AsideCategory />
  <AppMain />
</template>

<script setup>
import { onMounted } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import AsideCategory from '@/components/AsideCategory.vue';
import AppMain from '@/components/AppMain.vue';
import { loadLocalTemplateData } from '@/plugins/template';
import { useFontStore } from '@/stores/font';
import { filterSkyFonts } from '@/utils/font';
import { useBackgroundStore } from './stores/background';

const backgroundStore = useBackgroundStore();
const fontStore = useFontStore();
const promiseFontFetch = fontStore.fetch();

onMounted(async () => {
  const data = loadLocalTemplateData();
  if (data) {
    const { background } = data.bgStyle;
    const bgState = {};
    if (background.startsWith('url')) {
      bgState.type = '图片';
      const [url] = background.match(/(?<=url\()[^)]+/);
      bgState.image = url;
    } else {
      bgState.type = '颜色';
      bgState.color = background;
    }
    backgroundStore.setState(bgState);
    sky.setState(data);
  }

  await promiseFontFetch;

  const fontnames = filterSkyFonts();
  fontnames.forEach((name) => {
    const font = fontStore.list.find((f) => f.name === name);
    fontStore.addFont2Style(name, font.content.woff);
  });
});
</script>
