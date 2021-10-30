import { BackgroundState, Sky } from '../index';
import { Cloud } from './cloud';
import { scaleSize4Pre } from '../../tool';

export interface EditorPlugin {
  setBackground(background: BackgroundState): void;
  zoom(scale?: number): void;
  alignTop(): void;
  alignVerticalMiddle(): void;
  alignBottom(): void;
  alignLeft(): void;
  alignHorizontalMiddle(): void;
  alignRight(): void;
}

export default function createEditor(sky: Sky) {
  const module: EditorPlugin = {} as unknown as EditorPlugin;

  module.setBackground = (background) => {
    Object.assign(sky.state.background, background);
  };

  module.zoom = (scale = 1) => {
    if (scale === 0) return;
    if (scale === sky.state.scale) return;

    const zoomClouds = (clouds: Cloud[]) => {
      clouds.forEach(async (cloud) => {
        const width = scaleSize4Pre(cloud.width, sky.state.scale, scale);
        const height = scaleSize4Pre(cloud.height, sky.state.scale, scale);
        const top = scaleSize4Pre(cloud.top, sky.state.scale, scale);
        const left = scaleSize4Pre(cloud.left, sky.state.scale, scale);

        cloud.width = width;
        cloud.height = height;
        cloud.top = top;
        cloud.left = left;

        if (cloud.clouds && cloud.clouds.length > 0) {
          zoomClouds(cloud.clouds);
        }
      });
    };

    zoomClouds(sky.state.clouds);
    sky.cloud.updateCloudsElementRect(sky.state.clouds);

    sky.state.width = scaleSize4Pre(sky.state.width, sky.state.scale, scale);
    sky.state.height = scaleSize4Pre(sky.state.height, sky.state.scale, scale);

    // sky-editor 宽高样式使用 computed
    sky.vm.ctx.$nextTick(() => {
      sky.moveable.instance.updateRect();
    });
  };

  return module;
}
