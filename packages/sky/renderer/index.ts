import { App, ComponentOptions } from 'vue';
import SkyRenderer from './SkyRenderer.vue';
import './index.css';

export const skyRendererVuePlugin = {
  install(app: App, components?: { [key: string]: ComponentOptions }) {
    app.component(SkyRenderer.name, SkyRenderer);
    app.provide('SkyCloudComponents', components);
  },
};

export * as skyRendererStyle from './index.css?inline';
