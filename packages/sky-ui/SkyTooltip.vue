<template>
  <div class="sky-tooltip" :class="rootClass" :data-tips="content">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SkyTooltip',

  props: {
    content: {
      type: [String, Number],
      default: '',
    },

    direction: {
      type: String,
      default: 'top',
      validator(value) {
        return ['top', 'right', 'bottom', 'left'].includes(value);
      },
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    rootClass() {
      const classs = [`sky-tooltip--${this.direction}`];
      if (this.disabled) classs.push(`sky-tooltip--disabled`);
      if (this.active) classs.push(`sky-tooltip--active`);
      return classs;
    },
  },
};
</script>

<style lang="scss" scoped>
.sky-tooltip {
  @apply absolute;

  &::before,
  &::after {
    z-index: 9999;
    @apply invisible absolute pointer-events-none;
  }

  &::before {
    content: '';
    border-width: 6px;
    @apply border-transparent bg-transparent;
  }

  &::after {
    content: attr(data-tips);
    @apply px-2 py-1.5 rounded text-xs text-white bg-black whitespace-nowrap;
  }

  &--active {
    &::before,
    &::after {
      @apply visible;
    }
  }

  &--top {
    @apply -top-1.5 left-1/2;

    &::before,
    &::after {
      @apply bottom-full left-1/2;
    }

    &::before {
      border-top-color: #000;
      @apply transform -translate-x-1/2 translate-y-full;
    }

    &::after {
      @apply transform -translate-x-1/2;
    }
  }

  &--right {
    @apply -right-1.5 top-1/2;

    &::before,
    &::after {
      @apply left-full top-1/2;
    }

    &::before {
      border-right-color: #000;
      @apply transform -translate-y-1/2 -translate-x-full;
    }

    &::after {
      @apply transform -translate-y-1/2;
    }
  }

  &--bottom {
    @apply -bottom-1.5 left-1/2;

    &::before,
    &::after {
      @apply top-full left-1/2;
    }

    &::before {
      border-bottom-color: #000;
      @apply transform -translate-x-1/2 -translate-y-full;
    }

    &::after {
      @apply transform -translate-x-1/2;
    }
  }

  &--left {
    @apply -left-1.5 top-1/2;

    &::before,
    &::after {
      @apply right-full top-1/2;
    }

    &::before {
      border-left-color: #000;
      @apply transform -translate-y-1/2 translate-x-full;
    }

    &::after {
      @apply transform -translate-y-1/2;
    }
  }
}
</style>

<style lang="scss">
*:hover {
  > .sky-tooltip {
    &::before,
    &::after {
      @apply visible;
    }
  }

  > .sky-tooltip--disabled {
    &::before,
    &::after {
      @apply invisible;
    }
  }
}
</style>
