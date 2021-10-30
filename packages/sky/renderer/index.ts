import { App, DefineComponent } from 'vue';
import SkyRenderer from './SkyRenderer.vue';

export const skyRendererVuePlugin = {
  install(app: App, components?: { [propname: string]: DefineComponent }) {
    app.component(SkyRenderer.name, SkyRenderer);
    app.provide('SkyCloudComponents', components);
  },
};

export * as skyRendererStyle from './index.css';
