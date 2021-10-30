<template>
  <div
    class="bar__color-picker"
    @pointerdown.stop="showSkyColorPicker = !showSkyColorPicker"
  >
    <div
      class="relative h-6 rounded cursor-pointer"
      :style="{ background: $attrs.value }"
    >
      <div v-if="multiple" class="multiple-mask flex-center">多种颜色</div>
    </div>

    <SkyPopup
      v-model:visible="showSkyColorPicker"
      :width="256"
      @pointerdown.stop
    >
      <SkyColorPicker
        :straw-el="strawEl"
        :straw-css="strawCSS"
        v-bind="$attrs"
      />
    </SkyPopup>
  </div>
</template>

<script>
export default {
  name: 'BarColorPicker',
  inheritAttrs: false,
};
</script>

<script setup>
import { inject, onMounted, ref, watch } from 'vue';
import strawCSS from '@/straw-css';

const sky = inject('sky');

defineProps({
  multiple: {
    type: Boolean,
    default: false,
  },
});

const showSkyColorPicker = ref(false);
const strawEl = ref(null);

onMounted(() => {
  strawEl.value = sky.vm.subTree.children[0].el;
});
</script>

<style lang="scss" scoped>
.bar__color-picker {
  background: linear-gradient(
      to top right,
      hsla(0, 0%, 80%, 0.4) 25%,
      transparent 0,
      transparent 75%,
      hsla(0, 0%, 80%, 0.4) 0,
      hsla(0, 0%, 80%, 0.4)
    ),
    linear-gradient(
      to top right,
      hsla(0, 0%, 80%, 0.4) 25%,
      transparent 0,
      transparent 75%,
      hsla(0, 0%, 80%, 0.4) 0,
      hsla(0, 0%, 80%, 0.4)
    );
  background-size: 8px 8px;
  background-position: 0 0, 4px 4px;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 6%);

  @apply w-full rounded;
}

.multiple-mask {
  @apply absolute w-full h-full text-xs bg-white border border-dashed border-gray-500 rounded;
}
</style>
