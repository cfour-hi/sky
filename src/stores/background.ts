import { defineStore } from 'pinia';

interface State {
  type: string;
  color: string;
  image: string;
}

export const useBackgroundStore = defineStore('background', {
  state: (): State => ({
    type: '颜色',
    color: '#ffffff00',
    image: '',
  }),

  getters: {
    bgStyle: (state) => {
      return {
        background: state.type === '颜色' ? state.color : `url(${state.image})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      };
    },
  },

  actions: {
    setState(state: State & {}) {
      Object.assign(this.$state, state);
    },
  },
});
