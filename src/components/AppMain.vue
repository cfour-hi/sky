<script setup>
import { computed, inject, onMounted, ref } from 'vue';

const sky = inject('sky');
const elRoot = ref(null);

const skyEditorContainerStyle = computed(() => {
  return {
    width: `${sky.state.width}px`,
    height: `${sky.state.height}px`,
  };
});

onMounted(() => {
  sky.selecto.createInstance(elRoot.value);
});
</script>

<template>
  <div ref="elRoot" class="app-main">
    <div class="sky-editor-container" :style="skyEditorContainerStyle">
      <sky-editor class="sky-editor__app" />
    </div>
  </div>
</template>

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
