const clickOutSide = (
  el: HTMLElement,
  cb: () => void,
): {
  destroy: () => void;
} => {
  let moved = false;

  const onClickOutside = (e: MouseEvent) => {
    if (el.contains(e.target as Node)) return;
    cb();
  };

  const onmousemove = (e: MouseEvent) => {
    document.removeEventListener('mousemove', onmousemove);

    moved = true;
    onClickOutside(e);
  };

  const onmouseup = (e: MouseEvent) => {
    document.removeEventListener('mouseup', onmouseup);

    if (!moved) {
      onClickOutside(e);
    }
    moved = false;
  };

  const onMousedown = (e: MouseEvent) => {
    if (e.button === 0) {
      document.addEventListener('mousemove', onmousemove);
      document.addEventListener('mouseup', onmouseup);
    }
  };

  document.addEventListener('mousedown', onMousedown);
  document.addEventListener('contextmenu', onClickOutside);

  return {
    destroy: () => {
      document.removeEventListener('mousedown', onMousedown);
      document.removeEventListener('contextmenu', onClickOutside);
    },
  };
};

export default clickOutSide;
