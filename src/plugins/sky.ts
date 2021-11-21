import { App } from 'vue';
import CloudTextEditor from '@/components/clouds/text/Editor.vue';
import CloudImageEditor from '@/components/clouds/image/Editor.vue';
import ControlPanelContainer from '@/components/control-panel/Container.vue';
import createSky, { skyVuePlugin } from '@packages/sky/editor/index';
import initMousetrap from '@/plugins/mousetrap';
import { CLOUD_TYPE } from '@/constants';

export const sky = createSky({
  initMousetrap,
  selecto: '.app-main',
});
(window as any).sky = sky;

export default {
  install(app: App) {
    app.use(skyVuePlugin, sky, {
      ControlPanelContainer,
      components: {
        [CLOUD_TYPE.text]: CloudTextEditor,
        [CLOUD_TYPE.image]: CloudImageEditor,
      },
    });
  },
};
