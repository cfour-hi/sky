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

  // mounted() {
  //   this.onMousedownEl4PopupMixin = (event) => {
  //     event.stopPropagation();
  //   };
  //   this.$el.addEventListener('mousedown', this.onMousedownEl4PopupMixin);

  //   this.onClickEl4PopupMixin = (event) => {
  //     event.stopPropagation();
  //   };
  //   this.$el.addEventListener('click', this.onClickEl4PopupMixin);

  //   let visibleOnMousedownDoc = false;

  //   this.onMousedownDoc4PopupMixin = () => {
  //     visibleOnMousedownDoc = this.visible;
  //   };

  //   this.onClickDoc4PopupMixin = () => {
  //     if (visibleOnMousedownDoc) {
  //       this.$emit('update:visible', false);
  //       this.$emit('close');
  //     }
  //   };

  //   document.addEventListener('mousedown', this.onMousedownDoc4PopupMixin);
  //   document.addEventListener('click', this.onClickDoc4PopupMixin);
  // },

  // destroyed() {
  //   this.$el.removeEventListener('click', this.onClickEl4PopupMixin);
  //   this.$el.removeEventListener('mousedown', this.onMousedownEl4PopupMixin);
  //   document.removeEventListener('mousedown', this.onMousedownDoc4PopupMixin);
  //   document.removeEventListener('click', this.onClickDoc4PopupMixin);
  // },
};
