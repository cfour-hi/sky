export default {
  watch: {
    visible(value) {
      if (!value) return;

      this.mountEl = this.$parent.$el;
      while (this.mountEl && !Reflect.has(this.mountEl.dataset, 'skyPopup')) {
        this.mountEl = this.mountEl.parentElement;
      }
      if (!this.mountEl) return;

      const { top, left, width, height } = this.mountEl.getBoundingClientRect();
      this.$el.style.top = `${top + height}px`;

      // + width / 2
      // 方便 transform: translateX(-50%) 居中
      this.$el.style.left = `${left + width / 2}px`;
    },
  },
};
