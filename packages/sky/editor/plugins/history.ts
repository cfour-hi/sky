import { Sky, SkyRuntime, SkyState } from '../index';
let historyTimer: number | undefined;

export interface HistoryPlugin {
  stacks: string[];
  pointer: number;
  disable: boolean;
  delay: number;
  unshift(): void;
  back(): void;
  forward(): void;
}

export default function createHistory(sky: Sky) {
  const module: HistoryPlugin = {
    stacks: [],
    pointer: 0,
    disable: false,
    delay: 500,
  } as unknown as HistoryPlugin;

  const setPointer = (pointer: number) => {
    module.pointer = pointer;
    const stack: { state: SkyState; runtime: SkyRuntime } = JSON.parse(
      module.stacks[pointer],
    );
    if (!stack) return;

    /**
     * data 发生任何变更都会新增一条历史记录
     * 回退历史记录会变更 data
     * 但回退历史记录不能新增历史记录
     * 所以要禁止新增历史记录
     */
    module.disable = true;
    Object.assign(sky.state, stack.state);
    Object.assign(sky.runtime, stack.runtime);

    setTimeout(async () => {
      const target = stack.runtime.targetClouds.map((cloud) =>
        sky.cloud.queryCloudElementById(cloud.id),
      );
      await sky.moveable.setTarget(target as HTMLElement[]);

      sky.cloud.updateCloudsElementRect(stack.state.clouds);
      // clouds 发生任何改变都会触发添加历史记录
      // 等到数据更新完成之后再允许添加历史记录
      module.disable = false;
    });
  };

  module.unshift = () => {
    if (module.disable) return;

    clearTimeout(historyTimer);
    historyTimer = window.setTimeout(() => {
      if (module.pointer > 0) {
        module.stacks.splice(0, module.pointer);
      }
      module.stacks.unshift(
        JSON.stringify({
          state: sky.state,
          runtime: sky.runtime,
        }),
      );
      if (module.pointer > 0) {
        module.pointer = 0;
      }

      const { maxHistoryStack } = sky.options;
      if (maxHistoryStack && module.stacks.length > maxHistoryStack) {
        module.stacks.pop();
      }
    }, module.delay);
  };

  module.back = () => {
    const nextPointer = module.pointer + 1;
    if (nextPointer >= module.stacks.length) return;

    setPointer(nextPointer);
  };

  module.forward = () => {
    const nextPointer = module.pointer - 1;
    if (nextPointer < 0) return;

    setPointer(nextPointer);
  };

  return module;
}
