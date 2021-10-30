import { App, ComponentInternalInstance, DefineComponent, reactive } from 'vue';
import SkyEditorComponent from './SkyEditor.vue';
import { skyRendererVuePlugin } from '../renderer/index';
import createEditor, { EditorPlugin } from './plugins/editor';
import createCloud, { Cloud, CloudPlugin } from './plugins/cloud';
import createMoveable, { MoveablePlugin } from './plugins/moveable';
import createSelecto, { SelectoPlugin } from './plugins/selecto';
import createHistory, { HistoryPlugin } from './plugins/history';
import { restoreSize } from '../tool';

export interface CreateSkyOptions {
  maxHistoryStack?: number;
  initMousetrap?(sky: Sky): void;
}

export interface BackgroundState {
  color: string;
  opacity: number;
}

export interface SkyState {
  width: number;
  height: number;
  scale: number;
  background: BackgroundState;
  clouds: Cloud[];
}

export interface SkyRuntime {
  targetClouds: Cloud[];
  selectCloud: Cloud | null;
  clipboard: string;
}

export interface Sky {
  options: CreateSkyOptions;
  vm: DefineComponent;
  state: SkyState;
  editor: EditorPlugin;
  cloud: CloudPlugin;
  moveable: MoveablePlugin;
  selecto: SelectoPlugin;
  history: HistoryPlugin;
  setVM(vm: DefineComponent): void;
  setState(state: SkyState): Promise<unknown>;
  cloudVM: { [propname: string]: ComponentInternalInstance };
  runtime: SkyRuntime;
  birdVM: { [propname: string]: ComponentInternalInstance };
}

export default function createSky(options: CreateSkyOptions): Sky {
  options = { maxHistoryStack: 20, ...options };

  const module: Sky = {
    options,
    vm: null,
    cloudVM: {},
    birdVM: {},
  } as unknown as Sky;

  module.state = {
    width: 800,
    height: 800,
    scale: 1,
    background: {
      color: '#ffffff00',
      opacity: 1,
    },
    clouds: [],
  };
  module.runtime = {
    targetClouds: [],
    selectCloud: null,
    clipboard: '',
  };

  module.editor = createEditor(module);
  module.cloud = createCloud(module);
  module.moveable = createMoveable(module);
  module.selecto = createSelecto(module);
  module.history = createHistory(module);

  module.setState = async (state) => {
    if (Reflect.has(state, 'width')) {
      module.moveable.instance.verticalGuidelines = [0, state.width];
    }
    if (Reflect.has(state, 'height')) {
      module.moveable.instance.horizontalGuidelines = [0, state.height];
    }
    if (Reflect.has(state, 'scale')) {
      module.editor.zoom(state.scale);
    }
    if (Reflect.has(state, 'clouds')) {
      // 设置 clouds 等于重置
      await module.moveable.setTarget([]);
    }
    Object.assign(module.state, state);
    // Reflect.set(module, 'state', state);
  };

  options.initMousetrap?.(module);

  return module;
}

interface InstallOptions {
  ControlPanelContainer?: DefineComponent;
  components?: { [propname: string]: DefineComponent };
}

export const skyVuePlugin = {
  install(app: App, sky: Sky, options: InstallOptions) {
    sky.state = reactive(sky.state);
    sky.runtime = reactive(sky.runtime);

    app.config.globalProperties.$sky = sky;

    app.use(skyRendererVuePlugin, options.components);
    app.component(SkyEditorComponent.name, SkyEditorComponent);

    if (options.ControlPanelContainer) {
      app.component(
        options.ControlPanelContainer.name,
        options.ControlPanelContainer,
      );
    }

    app.provide('sky', sky);
  },
};
