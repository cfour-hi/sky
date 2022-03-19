<template>
  <div ref="elRoot" class="subcontrol-panel__advanced-text">
    <ControlPanelHeader show-back title="高级设置" @back="$emit('back')" />
  </div>
</template>

<script>
export default {
  name: 'AdvancedPanel',
};
</script>

<script setup>
import ControlPanelHeader from '@/components/control-panel/Header.vue';
</script>

<style lang="scss" scoped>
.subcontrol-panel__advanced-text {
  @apply absolute top-0 w-full h-full bg-white z-10;
}
</style>
