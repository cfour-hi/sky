import { Sky } from '../index';
import { lookUpTopCloudElement } from '../helper';
import { genRandomCode, withCtrlOrShiftKey } from '../../tool';
import { lookUpParentCloudElement } from '../helper';
import { n2px } from '../../tool';

export interface Cloud {
  type: string;
  id: string;
  pid: string;
  top: number;
  left: number;
  width: number;
  height: number;
  lock: boolean;
  opacity: number;
  rotate?: number;
  transform?: string;
  minDistance?: number;
  clouds?: Cloud[];
  [propsName: string]: unknown;
}

export interface CloudPlugin {
  getClouds(): Cloud[];
  getOverlappingClouds4Point(event: MouseEvent): Cloud[];
  getOverlappingClouds4Cloud(): Cloud[];
  findCloudById(id: string | undefined, clouds?: Cloud[]): Cloud | undefined;
  findCloudByElement(dom: HTMLElement): Cloud | undefined;
  queryCloudElementById(id: string): HTMLElement | null;
  updateCloudsElementRect(clouds?: Cloud[]): void;
  isCloudsObject(cloud: Cloud): boolean;
  setSelectCloud(event: any): void;
  create(attrs: any): any;
  push(...clouds: any[]): void;
  delete(options?: { force?: boolean }): void;
  toGroup(): void;
  unGroup(): void;
  lock(): void;
  unlock(): void;
  copy(): string | undefined;
  paste(): void;
  cut(): void;
  moveTop(): void;
  moveUp(): void;
  moveDown(): void;
  moveBottom(): void;
  alignTop(): void;
  alignVerticalMiddle(): void;
  alignBottom(): void;
  alignLeft(): void;
  alignHorizontalMiddle(): void;
  alignRight(): void;
  alignEditorTop(): void;
  alignEditorVerticalMiddle(): void;
  alignEditorBottom(): void;
  alignEditorLeft(): void;
  alignEditorHorizontalMiddle(): void;
  alignEditorRight(): void;
}

export default function createCloud(sky: Sky) {
  const module: CloudPlugin = {} as unknown as CloudPlugin;

  // 还原到画布未缩放的数据
  module.getClouds = () => {
    const { scale, clouds } = sky.state;
    const _clouds: Cloud[] = JSON.parse(JSON.stringify(clouds));

    const restore = (clouds: Cloud[]) => {
      clouds.forEach((cloud) => {
        cloud.top = cloud.top / scale;
        cloud.left = cloud.left / scale;
        cloud.width = cloud.width / scale;
        cloud.height = cloud.height / scale;

        if (cloud.clouds && cloud.clouds.length > 0) {
          restore(cloud.clouds);
        }
      });
    };

    restore(_clouds);

    return _clouds;
  };

  module.getOverlappingClouds4Point = (event) => {
    const { clientX, clientY } = event;

    const isInCloud = (cloud: Cloud) => {
      const el = sky.cloud.queryCloudElementById(cloud.id);
      const rect = el?.getBoundingClientRect();

      if (!rect) return false;

      const isInX = clientX >= rect.left && clientX <= rect.right;
      const isInY = clientY >= rect.top && clientY <= rect.bottom;

      return isInX && isInY;
    };

    return sky.state.clouds.filter(isInCloud);
  };

  module.updateCloudsElementRect = (
    clouds: Cloud[] = sky.runtime.targetClouds,
  ) => {
    clouds.forEach((cloud) => {
      const el = sky.cloud.queryCloudElementById(cloud.id);
      if (!el) return;

      el.style.top = n2px(cloud.top);
      el.style.left = n2px(cloud.left);
      el.style.width = n2px(cloud.width);
      el.style.height = n2px(cloud.height);

      sky.moveable.instance.updateTarget();

      if (cloud.clouds && cloud.clouds.length > 0) {
        module.updateCloudsElementRect(cloud.clouds);
      }
    });

    sky.moveable.instance.updateRect();
  };

  module.getOverlappingClouds4Cloud = () => {
    const rect = sky.moveable.instance.getRect();
    const ax1 = rect.left;
    const ax2 = rect.left + rect.width;
    const ay1 = rect.top;
    const ay2 = rect.top + rect.height;

    const isInnerX = (x: number) => x >= ax1 && x <= ax2;
    const isInnerY = (y: number) => y >= ay1 && y <= ay2;
    const isInner = (x: number, y: number) => isInnerX(x) && isInnerY(y);

    return sky.state.clouds.filter(({ top, left, width, height }) => {
      const bx1 = left;
      const bx2 = left + width;
      const by1 = top;
      const by2 = top + height;

      return (
        isInner(bx1, by1) ||
        isInner(bx2, by1) ||
        isInner(bx1, by2) ||
        isInner(bx2, by2) ||
        (by1 < ay1 && by2 > ay2 && isInnerX(bx1)) ||
        (bx1 < ax1 && bx2 > ax2 && isInnerY(by1))
      );
    });
  };

  module.findCloudById = (id, clouds = sky.state.clouds) => {
    if (!id) return;

    let cloud = clouds.find((cloud) => cloud.id === id);
    if (cloud) return cloud;

    for (let i = 0; i < clouds.length; i += 1) {
      if (Array.isArray(clouds[i].clouds)) {
        cloud = module.findCloudById(id, clouds[i].clouds);
        if (cloud) return cloud;
      }
    }
  };

  module.findCloudByElement = (el) => {
    const topElement = lookUpTopCloudElement(el);
    if (!topElement) return;

    return module.findCloudById(topElement.dataset.cloudId);
  };

  module.queryCloudElementById = (id) => {
    return sky.vm.ctx.$el.querySelector(`[data-cloud-id="${id}"]`);
  };

  const getSelectCloud = (event: any) => {
    if (!event) return null;

    const [targetCloud0] = sky.runtime.targetClouds;
    if (!targetCloud0) return null;
    if (!module.isCloudsObject(targetCloud0)) return null;
    if (withCtrlOrShiftKey(event)) return null;

    const el = lookUpParentCloudElement(event.target);
    if (!el) return null;

    const cloud = module.findCloudById(el.dataset.cloudId, targetCloud0.clouds);
    if (!cloud?.pid) return null;

    return cloud;
  };

  module.setSelectCloud = (event) => {
    const cloud = getSelectCloud(event);

    const oldCloud = sky.runtime.selectCloud;
    if (oldCloud === cloud) return;

    sky.runtime.selectCloud = cloud;

    /**
     * sky-renderer 不关心是否被选中
     * 所以不把 selectedCloud 作为 prop 传给 SkyRenderer
     * 而使用 DOM 操作 class
     */

    sky.vm.ctx.$el
      .querySelector('.sky-cloud-select')
      ?.classList.remove('sky-cloud-select');

    if (oldCloud) {
      sky.cloudVM[oldCloud.id]?.exposed?.skyHooks?.moveable?.onLeaveSelect?.();
      // const vm = sky.editor.getBirdVMById(oldCloud.id);
      // vm?.skyHooks?.moveable?.onLeaveSelect?.();
    }

    if (cloud) {
      sky.cloud
        .queryCloudElementById(cloud.id)
        ?.classList.add('sky-cloud-select');

      sky.cloudVM[cloud.id].exposed?.skyHooks?.moveable?.onEnterSelect?.();
      // const vm = sky.editor.getBirdVMById(cloud.id);
      // vm?.skyHooks?.moveable?.onEnterSelect?.();
    }
  };

  module.create = (attrs) => {
    attrs = JSON.parse(JSON.stringify(attrs));
    return Object.assign(
      {
        pid: '',
        width: 100,
        height: 100,
        top: sky.state.height / 2 - attrs.height / 2,
        left: sky.state.width / 2 - attrs.width / 2,
        angle: 0,
        lock: false,
        opacity: 1,
        transform: '',
      },
      attrs,
      {
        id: genRandomCode(),
      },
    );
  };

  module.push = async (...clouds) => {
    sky.state.clouds.push(...clouds);

    await sky.vm.ctx.$nextTick();

    await sky.moveable.setTarget(
      clouds.map(
        (cloud) => sky.cloud.queryCloudElementById(cloud.id) as HTMLElement,
      ),
    );
  };

  module.lock = () => {
    if (sky.runtime.targetClouds.length === 0) return;

    sky.runtime.targetClouds.forEach((cloud) => {
      cloud.lock = true;
    });
    sky.moveable.updateState();
  };

  module.unlock = () => {
    if (sky.runtime.targetClouds.length === 0) return;

    sky.runtime.targetClouds.forEach((cloud) => {
      cloud.lock = false;
    });
    sky.moveable.updateState();
  };

  module.delete = async ({ force = false } = {}) => {
    if (sky.runtime.targetClouds.length === 0) return;

    const [targetCloud0] = sky.runtime.targetClouds;
    if (targetCloud0.lock && !force) return;

    const targetIds = sky.runtime.targetClouds.map((cloud) => cloud.id);

    await sky.moveable.setTarget([]);

    targetIds.forEach((id: string) => {
      const index = sky.state.clouds.findIndex((cloud) => cloud.id === id);
      sky.state.clouds.splice(index, 1);
    });
  };

  module.copy = () => {
    if (sky.runtime.targetClouds.length === 0) return;

    sky.runtime.clipboard = JSON.stringify(sky.runtime.targetClouds);
    return sky.runtime.clipboard;
  };

  module.paste = async () => {
    if (!sky.runtime.clipboard) return;

    const copyClouds = (cloud: Cloud) => {
      cloud.clouds?.forEach((subCloud) => {
        subCloud.pid = cloud.id;
        subCloud.id = genRandomCode();

        if (module.isCloudsObject(subCloud)) {
          copyClouds(subCloud);
        }
      });
    };

    const clouds: Cloud[] = JSON.parse(sky.runtime.clipboard);

    const cloudsRect = {
      top: Math.min(...clouds.map((c) => c.top)),
      left: Math.min(...clouds.map((c) => c.left)),
    };
    const targetCloudsRect =
      sky.runtime.targetClouds.length > 0
        ? sky.moveable.instance.getRect()
        : cloudsRect;
    const targetRect = {
      top: targetCloudsRect.top - cloudsRect.top,
      left: targetCloudsRect.left - cloudsRect.left,
    };

    clouds.forEach((cloud) => {
      cloud.id = genRandomCode();
      cloud.top += targetRect.top + 10;
      cloud.left += targetRect.left + 10;

      if (module.isCloudsObject(cloud)) {
        copyClouds(cloud);
      }
    });

    await module.push(...clouds);

    module.copy();
  };

  module.cut = () => {
    const copy = module.copy();
    if (!copy) return;

    module.delete();
  };

  module.toGroup = async () => {
    const { top, left, width, height } = sky.moveable.instance.getRect();
    const targetClouds = [...sky.runtime.targetClouds];
    const id = genRandomCode();

    module.delete({ force: true });

    // 成组后子元素相对 targetClouds 定位
    targetClouds.forEach((cloud) => {
      cloud.pid = id;
      cloud.top = cloud.top - top;
      cloud.left = cloud.left - left;
    });

    await module.push({
      id,
      top,
      left,
      width,
      height,
      clouds: targetClouds,
      pid: '',
      type: 'clouds',
      lock: false,
      transform: '',
    });
  };

  module.unGroup = async () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length === 0) return;

    const { clouds, top, left /* transform */ } = targetClouds[0];
    if (!clouds) return;

    module.delete({ force: true });

    /**
     * 成组后子元素相对上一级容器定位
     * 上一级容器可能是 canvas，也可能仍是 clouds
     */
    clouds.forEach((cloud) => {
      cloud.pid = '';
      cloud.top = cloud.top + top;
      cloud.left = cloud.left + left;

      // TODO: 自身旋转 + 父级旋转 如何处理？
      // cloud.transform = transform;
    });
    module.push(...clouds);
  };

  module.moveTop = () => {
    const { clouds } = sky.state;
    const { targetClouds } = sky.runtime;

    clouds.push(...targetClouds);

    targetClouds.forEach((cloud) => {
      const index = clouds.findIndex((c) => c.id === cloud.id);
      clouds.splice(index, 1);
    });
  };

  module.moveUp = () => {
    const { clouds } = sky.state;
    const { targetClouds } = sky.runtime;
    const [lastTargetCloud] = targetClouds.slice(-1);
    const overlappingClouds = module.getOverlappingClouds4Cloud();
    const lastTargetCloudIndex = overlappingClouds.findIndex(
      (cloud) => cloud.id === lastTargetCloud.id,
    );

    let nextCloud: Cloud;
    if (lastTargetCloudIndex + 1 >= overlappingClouds.length) {
      nextCloud = lastTargetCloud;
    } else {
      nextCloud = overlappingClouds[lastTargetCloudIndex + 1];
    }
    const insertIndex = clouds.findIndex((cloud) => cloud.id === nextCloud.id);

    // 策略：先插入，再删除
    clouds.splice(insertIndex + 1, 0, ...targetClouds);

    targetClouds.forEach((cloud) => {
      const index = clouds.findIndex((c) => c.id === cloud.id);
      clouds.splice(index, 1);
    });
  };

  module.moveDown = () => {
    const { clouds } = sky.state;
    const { targetClouds } = sky.runtime;
    const [firstTargetCloud] = targetClouds;
    const overlappingClouds = module.getOverlappingClouds4Cloud();
    const firstTargetCloudIndex = overlappingClouds.findIndex(
      (cloud) => cloud.id === firstTargetCloud.id,
    );

    let preCloud: Cloud;
    if (firstTargetCloudIndex === 0) {
      preCloud = firstTargetCloud;
    } else {
      preCloud = overlappingClouds[firstTargetCloudIndex - 1];
    }
    const insertIndex = clouds.findIndex((cloud) => cloud.id === preCloud.id);

    // 策略：先删除，再插入
    targetClouds.forEach((cloud) => {
      const index = clouds.findIndex((c) => c.id === cloud.id);
      clouds.splice(index, 1);
    });

    clouds.splice(insertIndex, 0, ...targetClouds);
  };

  module.moveBottom = () => {
    const { clouds } = sky.state;
    const { targetClouds } = sky.runtime;

    targetClouds.reverse().forEach((cloud) => {
      const index = clouds.findIndex((c) => c.id === cloud.id);
      clouds.splice(index, 1);
    });

    clouds.unshift(...targetClouds.reverse());
  };

  module.isCloudsObject = (cloud) => {
    return cloud.type === 'clouds' && Reflect.has(cloud, 'clouds');
  };

  module.alignTop = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length <= 1) return;

    const top = Math.min(...targetClouds.map((cloud) => cloud.top));
    targetClouds.forEach((cloud) => {
      cloud.top = top;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignVerticalMiddle = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length <= 1) return;

    const top = Math.min(...targetClouds.map((cloud) => cloud.top));
    const bottom = Math.max(
      ...targetClouds.map((cloud) => cloud.top + cloud.height),
    );
    const middle = top + (bottom - top) / 2;

    targetClouds.forEach((cloud) => {
      cloud.top = middle - cloud.height / 2;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignBottom = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length <= 1) return;

    const bottom = Math.max(
      ...targetClouds.map((cloud) => cloud.top + cloud.height),
    );
    targetClouds.forEach((cloud) => {
      cloud.top = bottom - cloud.height;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignHorizontalMiddle = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length <= 1) return;

    const left = Math.min(...targetClouds.map((cloud) => cloud.left));
    const right = Math.max(
      ...targetClouds.map((cloud) => cloud.left + cloud.width),
    );
    const middle = left + (right - left) / 2;

    targetClouds.forEach((cloud) => {
      cloud.left = middle - cloud.width / 2;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignLeft = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length <= 1) return;

    const left = Math.min(...targetClouds.map((cloud) => cloud.left));
    targetClouds.forEach((cloud) => {
      cloud.left = left;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignRight = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length <= 1) return;

    const right = Math.max(
      ...targetClouds.map((cloud) => cloud.left + cloud.width),
    );
    targetClouds.forEach((cloud) => {
      cloud.left = right - cloud.width;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignEditorTop = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length === 0) return;

    targetClouds.forEach((cloud) => {
      cloud.top = 0;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignEditorVerticalMiddle = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length === 0) return;

    const middle = sky.state.height / 2;

    targetClouds.forEach((cloud) => {
      cloud.top = middle - cloud.height / 2;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignEditorBottom = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length === 0) return;

    targetClouds.forEach((cloud) => {
      cloud.top = sky.state.height - cloud.height;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignEditorLeft = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length === 0) return;

    targetClouds.forEach((cloud) => {
      cloud.left = 0;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignEditorHorizontalMiddle = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length === 0) return;

    const middle = sky.state.width / 2;

    targetClouds.forEach((cloud) => {
      cloud.left = middle - cloud.width / 2;
    });

    sky.cloud.updateCloudsElementRect();
  };

  module.alignEditorRight = () => {
    const { targetClouds } = sky.runtime;
    if (targetClouds.length === 0) return;

    targetClouds.forEach((cloud) => {
      cloud.left = sky.state.width - cloud.width;
    });

    sky.cloud.updateCloudsElementRect();
  };

  return module;
}
