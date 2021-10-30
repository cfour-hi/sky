<template>
  <svg
    :class="`svg-icon__${filename}`"
    class="svg-icon"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
};
</script>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  filename: String,
});

const iconName = computed(() => `#svg-icon__${props.filename}`);
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  @apply fill-current;
}
</style>
