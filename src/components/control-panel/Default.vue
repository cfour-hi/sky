<template>
  <div class="control-panel__default">
    <ControlPanelHeader title="画布" />

    <div class="body">
      <div class="panel-label">
        <span>画布尺寸</span>
        <SkyButton size="small" plain>编辑</SkyButton>
      </div>

      <div class="size">
        <SkyInput :value="width" readonly>
          <template #append>宽</template>
        </SkyInput>

        <i class="w-2"></i>

        <SkyInput :value="height" readonly>
          <template #append>高</template>
        </SkyInput>
      </div>

      <div class="panel-label">
        <span>画布背景</span>
      </div>

      <SkyTabs v-model:value="activeTab" class="bg-tabs" data-sky-popup>
        <SkyTabPanel class="bar bar__color" label="颜色">
          <BarColorPicker
            v-model:value="background"
            default-color="#ffffffff"
            :modes="['纯色', '渐变']"
          />
        </SkyTabPanel>

        <SkyTabPanel label="图片">
          <SkyButton style="height: 40px" @click="showBgDialog = true"
            >上传背景图</SkyButton
          >
        </SkyTabPanel>
      </SkyTabs>
    </div>

    <SkyDialog v-model:visible="showBgDialog" />
  </div>
</template>

<script>
export default {
  name: 'ControlPanelDefault',
};
</script>

<script setup>
import { computed, ref, inject } from 'vue';
import ControlPanelHeader from './Header.vue';
import BarColorPicker from '../biz/BarColorPicker.vue';

const sky = inject('sky');

const activeTab = ref('颜色');
const showBgDialog = ref(false);

const width = computed(
  () => `${parseInt(sky.state.width / sky.state.scale)}px`,
);
const height = computed(
  () => `${parseInt(sky.state.height / sky.state.scale)}px`,
);
const background = computed({
  get() {
    return sky.state.background.color;
  },
  set(value) {
    sky.state.background.color = value;
  },
});
</script>

<style lang="scss" scoped>
.size {
  @apply flex justify-between mb-5;

  .sky-input {
    @apply w-1/2;
  }
}

.panel-label {
  @apply flex justify-between text-xs mb-3 text-gray-700;
}

.bg-tabs {
  @apply mb-3;
}
</style>
