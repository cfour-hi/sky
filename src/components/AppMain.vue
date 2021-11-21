<template>
  <div class="app-main">
    <div class="sky-editor-container" :style="skyEditorContainerStyle">
      <sky-editor class="sky-editor__app" :bg-style="backgroundStore.bgStyle" />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useBackgroundStore } from '@/stores/background';

const sky = inject('sky');
const backgroundStore = useBackgroundStore();

const skyEditorContainerStyle = computed(() => {
  return {
    width: `${sky.state.width}px`,
    height: `${sky.state.height}px`,
  };
});
</script>

<style lang="scss" scoped>
.app-main {
  @apply absolute bg-gray-100 overflow-auto;

  top: var(--app-header-height);
  left: var(--aside-category-width);
  right: var(--aside-control-width);
  bottom: 0;
}

.sky-editor-container {
  @apply box-content my-0 mx-auto;
}
</style>
