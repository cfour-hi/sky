<template>
  <div
    ref="elRoot"
    class="sky-cloud sky-clouds sky-bird"
    :data-cloud-id="props.cloud.id"
    :style="rootStyle"
  >
    <!-- resize 时 scale -->
    <div>
      <template v-for="subCloud in props.cloud.clouds" :key="subCloud.id">
        <Clouds
          v-if="subCloud.type === 'clouds'"
          :cloud="subCloud"
          v-bind="$attrs"
        />
        <Cloud v-else :cloud="subCloud" v-bind="$attrs" />
      </template>
    </div>

    <i class="border-before" />
  </div>
</template>

<script>
export default {
  name: 'Clouds',
  inheritAttrs: false,
};
</script>

<script setup>
import { computed, ref, onMounted, watchEffect } from 'vue';
import Cloud from './Cloud.vue';

const props = defineProps({
  cloud: {
    type: Object,
    required: true,
  },
});

const elRoot = ref();

const rootStyle = computed(() => {
  return {
    opacity: props.cloud.opacity,
  };
});

onMounted(() => {
  watchEffect(() => {
    Object.assign(elRoot.value.style, {
      width: `${props.cloud.width}px`,
      height: `${props.cloud.height}px`,
      top: `${props.cloud.top}px`,
      left: `${props.cloud.left}px`,
    });
  });
});
</script>
