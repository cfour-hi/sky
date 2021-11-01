<template>
  <div class="aside-category"></div>
</template>

<script>
export default {
  name: 'AsideCategory',
};
</script>

<style lang="scss" scoped>
.aside-category {
  position: absolute;
  top: var(--app-header-height);
  bottom: 0;
  width: var(--aside-category-width);
  background-color: #fff;
}
</style>
