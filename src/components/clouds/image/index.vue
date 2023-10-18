<template>
  <div class="cloud__image">
    <img :src="cloud.src" alt="" class="image__content" />
  </div>
</template>

<script>
export default {
  name: 'CloudImage',
};
</script>

<script setup>
const props = defineProps({
  cloud: {
    type: Object,
    required: true,
  },
});
</script>

<style src="./index.css"></style>
