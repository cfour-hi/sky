import { Sky } from '@packages/sky/editor';
import Selecto, { OnDragStart, OnSelect } from 'selecto';
import { getElementInfo } from 'moveable';
import { isBackgroundElement } from '../helper';

export interface SelectoPlugin {
  createInstance(container: HTMLElement): void;
  instance: Selecto;
}

export default function createSelecto(sky: Sky) {
  let flagMousemove = false;

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

    module.instance.on('selectStart', onSelectStart);
    module.instance.on('select', onSelect);
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

  function onSelectStart(event: OnDragStart) {
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

  async function onMousemove() {
    flagMousemove = true;
    await sky.moveable.setTarget([]);
  }

  async function onMouseup(event: MouseEvent) {
    if (!flagMousemove) {
      document.removeEventListener('mousemove', onMousemove);
      if (isBackgroundElement(event.target as HTMLElement)) return;

      await sky.moveable.setTarget([]);
    }
    flagMousemove = false;
  }

  async function onSelect(event: OnSelect) {
    console.log('onSelect');
    await sky.moveable.setTarget([...event.selected] as HTMLElement[]);
  }
}
