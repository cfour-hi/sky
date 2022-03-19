<template>
  <div class="header">
    <svg-icon v-if="showBack" filename="arrow-left" @click="$emit('back')" />
    <div>{{ title }}</div>
  </div>
</template>

<script>
export default {
  name: 'ControlPanelHeader',
};
</script>

<script setup>
defineProps({
  showBack: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: '',
  },
});

defineEmits(['back']);
</script>

<style lang="scss" scoped>
.header {
  .svg-icon__arrow-left {
    @apply mr-2 cursor-pointer;
  }

  @apply flex items-center h-12 px-6 border-b text-sm font-bold;
}
</style>
