import { Sky } from '../index';
import { Cloud } from './cloud';
import Moveable, {
  OnClick,
  OnDrag,
  OnDragGroup,
  OnRenderEnd,
  OnResize,
  OnResizeEnd,
  OnResizeGroup,
  OnResizeGroupStart,
  OnResizeStart,
  OnRotate,
  OnRotateGroup,
} from 'moveable';
import { lookUpTopCloudElement, isBackgroundElement } from '../helper';
import {
  n2px,
  hop,
  withCtrlOrShiftKey,
  isEqualArray,
  difference,
} from '../../tool';
import { CLOUD_RENDER_DIRECTIONS } from '../../constants';
import { sleep } from '../tool';

export interface MoveablePlugin {
  instance: Moveable;
  createInstance(el: HTMLElement): void;
  getTarget(event: any): HTMLElement[];
  setTarget(target: HTMLElement[] | null): void;
  updateState(): void;
  [propsName: string]: any;
}

const DIRECTION = {
  '-1,-1': 'nw',
  '0,-1': 'n',
  '1,-1': 'ne',
  '1,0': 'e',
  '1,1': 'se',
  '0,1': 's',
  '-1,1': 'sw',
  '-1,0': 'w',
};

const DEFAULT_RENDER_DIRECTIONS = ['n', 'nw', 'ne', 's', 'se', 'sw', 'e', 'w'];

const toPosition = (cloud: Cloud) => {
  const { top, left, width, height } = cloud;
  const right = left + width;
  const bottom = top + height;

  // 与 moveable getRect 方法返回数据保持一致
  return {
    pos1: [left, top],
    pos2: [right, top],
    pos3: [left, bottom],
    pos4: [right, bottom],
  };
};

export default function createMoveable(sky: Sky) {
  const module: MoveablePlugin = {} as unknown as MoveablePlugin;

  module.updateState = async () => {
    const { target } = module.instance;
    if (!Array.isArray(target)) return;
    if (target.length === 0) return;

    const [target0] = target;
    const target0Cloud = sky.cloud.findCloudById(target0.dataset.cloudId);
    // false -> 背景 | 未知
    const moveable = target0Cloud ? !target0Cloud.lock : false;

    module.instance.draggable = moveable;
    module.instance.resizable = moveable;
    module.instance.rotatable = moveable;
    module.instance.origin = moveable;

    if (target0Cloud) {
      if (target.length > 1) {
        // THINK: configuable?
        module.instance.renderDirections = CLOUD_RENDER_DIRECTIONS;
      } else {
        module.instance.renderDirections =
          sky.birdVM[target0.dataset.cloudId]?.exposed?.skyHooks?.moveable
            ?.renderDirections ?? DEFAULT_RENDER_DIRECTIONS;
      }
      module.instance.passDragArea = !moveable;
    } else {
      // 背景 | 其它 -> 开启点击穿透
      module.instance.passDragArea = true;
    }

    const className = [];
    if (target0Cloud?.lock) className.push('lock');
    module.instance.className = className.join(' ');
  };

  module.getTarget = (event) => {
    let targetEl = lookUpTopCloudElement(event.target);
    if (!targetEl) return [];

    const withCSKey = withCtrlOrShiftKey(event);
    // 点击到 moveable dragArea 不会进入此方法，这里一定是点击新的图层
    if (!withCSKey) return [targetEl];

    const targetCloud = sky.cloud.findCloudById(targetEl.dataset.cloudId);
    // 目标图层被锁定 或 当前图层被锁定，都不能多选
    if (targetCloud?.lock || sky.runtime.targetClouds[0].lock) {
      return module.instance.target as HTMLElement[];
    }

    // moveable target 肯定为数组
    const newTarget = [...(module.instance.target as HTMLElement[])];
    const targetIndex = newTarget.findIndex((t) => t === targetEl);
    if (targetIndex < 0) {
      newTarget.push(targetEl);
    } else {
      // 图标图层已选中的情况下，取消选中
      newTarget.splice(targetIndex, 1);
    }
    return newTarget;
  };

  module.setTarget = async (target) => {
    const oldTarget = module.instance.target as HTMLElement[];

    if (target) {
      if (isEqualArray(target, oldTarget)) return;
      module.instance.target = target;

      // FIXME: moveable target 的赋值有 setTimeout 延迟
      await sleep();

      const targetClouds = target.map((el) =>
        sky.cloud.findCloudById(el.dataset.cloudId),
      );
      sky.runtime.targetClouds = sky.state.clouds.filter((cloud) =>
        targetClouds.includes(cloud),
      );

      // 切换新的 target，移除组图层内的选中图层
      sky.cloud.setSelectCloud(null);

      const leaveTargets = difference(oldTarget, target);
      leaveTargets.forEach((_target) => {
        const vm = sky.birdVM[_target.dataset.cloudId as string];
        vm?.exposed?.skyHooks?.moveable?.onLeaveTarget?.();
      });

      const enterTargets = difference(target, oldTarget);
      enterTargets.forEach((_target) => {
        const vm = sky.birdVM[_target.dataset.cloudId as string];
        vm?.exposed?.skyHooks?.moveable?.onEnterTarget?.();
      });

      // const mergeTargets = uniq([...target, ...oldTarget]);
      // mergeTargets.forEach(target => {
      //   const vm = this.getBirdVM(target);
      //   if (vm.skyHooks?.moveable?.onChangeTarget) {
      //     vm.skyHooks.moveable.onChangeTarget();
      //   }
      // });

      sky.state.clouds.forEach((cloud: Cloud) => {
        const vm = sky.birdVM[cloud.id];
        vm?.exposed?.skyHooks?.moveable?.onChangeTarget?.();
      });
    } else {
      module.instance.target = [];
      oldTarget.forEach((_target) => {
        const vm = sky.birdVM[_target.dataset.cloudId as string];
        vm?.exposed?.skyHooks?.moveable?.onLeaveTarget?.();
      });
    }
    module.updateState();
  };

  const updateElementGuidelines = (): void => {
    const { target } = module.instance;
    if (!Array.isArray(target)) return;

    const rect = module.instance.getRect();
    const topPos = {
      pos1: rect.pos1,
      pos2: rect.pos2,
      pos3: rect.pos3,
      pos4: rect.pos4,
    };
    const guidelines: Cloud[] = [];

    sky.state.clouds.forEach((cloud: Cloud) => {
      const isInside =
        target.findIndex((t) => t.dataset.cloudId === cloud.id) >= 0;
      if (isInside) return;

      const pos = toPosition(cloud);
      const distances: number[] = [];

      Object.values(topPos).forEach((topPosValue) => {
        Object.values(pos).forEach((posValue) => {
          const x = Math.abs(topPosValue[0] - posValue[0]);
          const y = Math.abs(topPosValue[1] - posValue[1]);
          distances.push(Math.sqrt(x * x + y * y));
        });
      });

      const minDistance = Math.min(...distances);
      if (hop(cloud, 'minDistance')) {
        cloud.minDistance = minDistance;
      } else {
        Object.defineProperty(cloud, 'minDistance', {
          value: minDistance,
          writable: true,
        });
      }

      guidelines.push(cloud);
    });

    guidelines.sort((a, b) => {
      return (a.minDistance as number) - (b.minDistance as number);
    });

    module.instance.elementGuidelines = guidelines
      .slice(0, 5)
      .map((cloud) => sky.cloud.queryCloudElementById(cloud.id) as HTMLElement);
  };

  const onDrag = (event: OnDrag): void => {
    // console.log('onDrag', event);

    const { target, top, left } = event;

    // 必须同步操作
    target.style.top = n2px(top);
    target.style.left = n2px(left);

    const cloud = sky.state.clouds.find(
      (cloud) => cloud.id === target.dataset.cloudId,
    ) as Cloud;
    cloud.top = top;
    cloud.left = left;

    updateElementGuidelines();
  };

  const onDragGroup = (event: OnDragGroup): void => {
    event.events.forEach(onDrag);
  };

  const onResizeStart = (event: OnResizeStart): void => {
    const { target, datas, direction } = event;
    const cloud = sky.cloud.findCloudById(target.dataset.cloudId);

    if (!cloud) return;

    datas.targetCloud = cloud;
    datas.startTop = cloud.top;
    datas.startLeft = cloud.left;
    datas.startWidth = cloud.width;
    datas.startHeight = cloud.height;
    datas.isClouds = sky.cloud.isCloudsObject(cloud);

    datas.birdVM = sky.birdVM[cloud.id];
    module.instance.keepRatio =
      datas.birdVM?.exposed?.skyHooks?.moveable?.keepRatio?.includes(
        Reflect.get(DIRECTION, direction.join()),
      );
    datas.birdVM?.exposed?.skyHooks?.moveable?.onResizeStart?.(event);
  };

  const onResize = (event: OnResize): void => {
    /**
     * nw      n      ne
     * [-1,-1] [0,-1] [1,-1]
     * w              e
     * [-1, 0] [0, 0] [1, 0]
     * sw      s      se
     * [-1, 1] [0, 1] [1, 1]
     */

    // console.log('onResize', event);

    const { target, width, height, drag, datas } = event;
    datas.scale = [width / datas.startWidth, height / datas.startHeight];

    // 必须同步操作
    target.style.width = n2px(width);
    target.style.height = n2px(height);

    datas.targetCloud.width = width;
    datas.targetCloud.height = height;

    if (datas.isClouds) {
      (
        target.firstElementChild as HTMLElement
      ).style.transform = `scale(${datas.scale[0]}, ${datas.scale[1]})`;
      (target.firstElementChild as HTMLElement).style.transformOrigin =
        'left top';
    }

    onDrag(drag);

    datas.birdVM?.exposed?.skyHooks?.moveable?.onResize?.(event);
  };

  const onResizeEnd = (event: OnResizeEnd): void => {
    const { target, datas } = event;

    const update = (clouds: Cloud[]): void => {
      clouds.forEach((cloud) => {
        cloud.top = cloud.top * datas.scale[1];
        cloud.left = cloud.left * datas.scale[0];
        cloud.width = cloud.width * datas.scale[0];
        cloud.height = cloud.height * datas.scale[1];

        const el = sky.cloud.queryCloudElementById(cloud.id);
        if (!el) return;

        el.style.top = n2px(cloud.top);
        el.style.left = n2px(cloud.left);
        el.style.width = n2px(cloud.width);
        el.style.height = n2px(cloud.height);

        if (cloud.clouds) {
          update(cloud.clouds);
        } else {
          const vm = sky.birdVM[cloud.id];
          vm?.exposed?.moveable?.onResizeEndInGroup?.(event);
        }
      });
    };

    if (datas.isClouds) {
      (target.firstElementChild as HTMLElement).style.transform = '';
      (target.firstElementChild as HTMLElement).style.transformOrigin = '';

      update(datas.targetCloud.clouds);
    }

    datas.birdVM?.exposed?.skyHooks?.moveable?.onResizeEnd?.(event);
  };

  const onResizeGroupStart = (event: OnResizeGroupStart): void => {
    event.events.forEach(onResizeStart);

    // THINK: configuable?
    sky.moveable.instance.keepRatio = true;
  };

  const onResizeGroup = (event: OnResizeGroup): void => {
    event.events.forEach(onResize);
  };

  const onRotate = (event: OnRotate): void => {
    const { target, drag, absoluteRotate } = event;
    target.style.transform = drag.transform;

    const cloud = sky.state.clouds.find(
      (cloud) => cloud.id === target.dataset.cloudId,
    );
    if (!cloud) return;

    cloud.transform = drag.transform;
    cloud.rotate = absoluteRotate;
  };

  const onRotateGroup = (event: OnRotateGroup): void => {
    event.events.forEach(onRotate);
  };

  const onRenderStart = (): void => {
    sky.history.disable = true;
  };

  const onRenderEnd = (event: OnRenderEnd): void => {
    sky.history.disable = false;

    // 点击 dragArea 蒙层不会触发 onDrag
    // 但会触发 onRenderStart 和 onRenderEnd
    // 这种情况下不去添加历史记录
    if (!event.isDrag) return;

    sky.history.unshift();
  };

  const onClickMoveableArea = async (event: OnClick) => {
    // console.log('onClickMoveableArea', event);

    // 多选的情况下，切换选中其中一个
    if (sky.runtime.targetClouds.length > 1) {
      const target = module.getTarget(event.inputEvent);
      await module.setTarget(target);
    }
    sky.cloud.setSelectCloud(event.inputEvent);

    const birdVM = sky.birdVM[event.target.dataset.cloudId as string];
    birdVM?.exposed?.skyHooks?.moveable?.onClick?.(event.inputEvent);
  };

  module.createInstance = (el) => {
    (window as any).moveableInstance = module.instance = new Moveable(el, {
      target: [],
      snappable: true,
      dragArea: true,
      horizontalGuidelines: [0, el.offsetWidth],
      verticalGuidelines: [0, el.offsetHeight],
    });

    module.instance.on('drag', onDrag);
    module.instance.on('dragGroup', onDragGroup);

    module.instance.on('resizeStart', onResizeStart);
    module.instance.on('resize', onResize);
    module.instance.on('resizeEnd', onResizeEnd);
    module.instance.on('resizeGroupStart', onResizeGroupStart);
    module.instance.on('resizeGroup', onResizeGroup);

    module.instance.on('rotate', onRotate);
    module.instance.on('rotateGroup', onRotateGroup);

    module.instance.on('renderStart', onRenderStart);
    module.instance.on('renderEnd', onRenderEnd);
    module.instance.on('renderGroupStart', onRenderStart);
    module.instance.on('renderGroupEnd', onRenderEnd);

    module.instance.on('click', onClickMoveableArea);
    module.instance.on('clickGroup', onClickMoveableArea);

    module.updateState();
  };

  return module;

  // return new Proxy(module, {
  //   get(target, key) {
  //     if (Reflect.has(target, key)) {
  //       return Reflect.get(target, key);
  //     }
  //     return Reflect.get(module.instance, key);
  //   },

  //   set(target, key, value) {
  //     console.log('proxy moveable set', target, key, value);

  //     // if (key === 'target') {
  //     // module.setTarget(value);
  //     // } else
  //     if (Reflect.has(target, key)) {
  //       Reflect.set(target, key, value);
  //     } else {
  //       Reflect.set(target.instance, key, value);
  //     }
  //     return true;
  //   },
  // });
}
