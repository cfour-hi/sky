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
import { filterSkyFonts } from '@/utils/dom-2-image';

const fontStore = useFontStore();
const promiseFontFetch = fontStore.fetch();

onMounted(async () => {
  const data = loadLocalTemplateData();
  if (data) {
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
