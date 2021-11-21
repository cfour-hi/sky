import { Sky } from '../index';
import Selecto, { OnDragStart, OnSelect } from 'selecto';
import { getElementInfo } from 'moveable';
import {
  SKY_CLOUD_LOCK,
  SKY_BACKGROUND,
  SKY_BACKGROUND_ACTIVE,
} from '../../constants';

export interface SelectoPlugin {
  createInstance(container: HTMLElement): void;
  instance: Selecto;
}

export default function createSelecto(sky: Sky) {
  let flagMousemove = false;
  let elSkyBackground: HTMLElement;

  const module: SelectoPlugin = {
    instance: null,
  } as unknown as SelectoPlugin;

  module.createInstance = (container) => {
    module.instance = new Selecto({
      container,
      selectableTargets: ['.sky-cloud'],
      // selectByClick & selectFromInside: 点击 cloud 的时候不触发 selecto
      selectByClick: false,
      selectFromInside: false,
      hitRate: 0,
      getElementRect: getElementInfo,
    });

    // 不能用 selectStart，会导致缩放的时候也触发框选
    module.instance.on('dragStart', onDragStart);
    module.instance.on('select', onSelect);
    module.instance.on('selectEnd', onSelectEnd);

    elSkyBackground = sky.vm.subTree.el.querySelector(`.${SKY_BACKGROUND}`);
  };

  return new Proxy(module, {
    get(target, key) {
      if (Reflect.has(target, key)) {
        return Reflect.get(target, key);
      }
      return Reflect.get(module.instance, key);
    },

    set(target, key, value) {
      if (Reflect.has(target, key)) {
        Reflect.set(target, key, value);
      } else {
        Reflect.set(target.instance, key, value);
      }
      return true;
    },
  });

  function onDragStart(event: OnDragStart) {
    const moveableControlBox = document.querySelector('.moveable-control-box');
    const skyControlPanel = document.querySelector('.sky-control-panel');

    if (
      moveableControlBox?.contains(event.inputEvent.target) ||
      skyControlPanel?.contains(event.inputEvent.target)
    ) {
      return event.stop();
    }

    document.addEventListener('mousemove', onMousemove, { once: true });
    document.addEventListener('mouseup', onMouseup, { once: true });
  }

  function onMousemove() {
    flagMousemove = true;
    sky.moveable.setTarget([]);
  }

  async function onMouseup(event: MouseEvent) {
    if (!flagMousemove) {
      document.removeEventListener('mousemove', onMousemove);
    }
    flagMousemove = false;
  }

  function onSelect(event: OnSelect) {
    const selected = event.selected.filter(
      (el) => !el.classList.contains(SKY_CLOUD_LOCK),
    );
    sky.moveable.setTarget(selected as HTMLElement[]);
  }

  function onSelectEnd() {
    elSkyBackground.classList.remove(SKY_BACKGROUND_ACTIVE);
  }
}
