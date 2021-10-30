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

const fontStore = useFontStore();
const promiseFontFetch = fontStore.fetch();

onMounted(async () => {
  // SkyEditor 在 AppMain 组件内
  // SkyEditor 的一些准备工作需要等到 mounted 执行
  // await nextTick();

  const data = loadLocalTemplateData();
  if (data) {
    sky.setState(data);
  }

  await promiseFontFetch;

  sky.state.clouds
    .filter((cloud) => cloud.type === 'text')
    .forEach((cloud) => {
      const font = fontStore.list.find((f) => f.name === cloud.fontFamily);
      if (!font) {
        cloud.fontFamily = 'SourceHanSansSC-Regular';
        return;
      }

      fontStore.addFont2Style(font.name, font.content.woff);
    });
});
</script>
