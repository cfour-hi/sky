import Mousetrap from 'mousetrap';
import { Sky } from '@packages/sky/editor/index';
import { IS_MAC } from '../constants/runtime';
import { saveTemplate2Local } from './template';

export default function initMousetrap(sky: Sky) {
  Mousetrap.bind('up', (e) => {
    e.preventDefault();
    sky.moveable.instance.request('draggable', { deltaY: -1 }, true);
  });
  Mousetrap.bind('shift+up', (e) => {
    e.preventDefault();
    sky.moveable.instance.request('draggable', { deltaY: -10 }, true);
  });
  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+up`, (e) => {
    e.preventDefault();
    sky.cloud.moveUp();
  });
  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+shift+up`, (e) => {
    e.preventDefault();
    sky.cloud.moveTop();
  });

  Mousetrap.bind('right', (e) => {
    e.preventDefault();
    sky.moveable.instance.request('draggable', { deltaX: 1 }, true);
  });
  Mousetrap.bind('shift+right', (e) => {
    e.preventDefault();
    sky.moveable.instance.request('draggable', { deltaX: 10 }, true);
  });
  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+right`, (e) => {
    // Chrome 默认行为是历史记录前进
    e.preventDefault();
  });

  Mousetrap.bind('down', (e) => {
    e.preventDefault();
    sky.moveable.instance.request('draggable', { deltaY: 1 }, true);
  });
  Mousetrap.bind('shift+down', (e) => {
    e.preventDefault();
    sky.moveable.instance.request('draggable', { deltaY: 10 }, true);
  });
  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+down`, (e) => {
    e.preventDefault();
    sky.cloud.moveDown();
  });
  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+shift+down`, (e) => {
    e.preventDefault();
    sky.cloud.moveBottom();
  });

  Mousetrap.bind('left', (e) => {
    e.preventDefault();
    sky.moveable.instance.request('draggable', { deltaX: -1 }, true);
  });
  Mousetrap.bind('shift+left', (e) => {
    // Chrome 默认行为是历史记录后退
    e.preventDefault();
    sky.moveable.instance.request('draggable', { deltaX: -10 }, true);
  });
  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+left`, (e) => {
    e.preventDefault();
  });

  Mousetrap.bind(['backspace', 'del'], (e) => {
    e.preventDefault();
    sky.cloud.delete();
  });

  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+c`, (e) => {
    e.preventDefault();
    sky.cloud.copy();
  });
  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+v`, (e) => {
    e.preventDefault();
    sky.cloud.paste();
  });
  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+x`, (e) => {
    e.preventDefault();
    sky.cloud.cut();
  });

  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+z`, (e) => {
    e.preventDefault();
    sky.history.back();
  });

  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+shift+z`, (e) => {
    e.preventDefault();
    sky.history.forward();
  });

  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+s`, (e) => {
    e.preventDefault();
    saveTemplate2Local(sky.state);
  });

  Mousetrap.bind(`${IS_MAC ? 'command' : 'ctrl'}+a`, async (e) => {
    e.preventDefault();

    const elSkyRenderer = document.querySelector(
      '.sky-editor__app .sky-renderer',
    );
    if (!elSkyRenderer) return;

    const target = Array.from(elSkyRenderer.children).filter(
      (el) => (el as HTMLElement).dataset.cloudId,
    );
    await sky.moveable.setTarget(target as HTMLElement[]);
  });
}
