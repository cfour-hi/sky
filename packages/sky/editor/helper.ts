export const isCloudElement = (cloud: HTMLElement | SVGElement): boolean => {
  return cloud.classList.contains('sky-cloud');
};

export const isCloudElementInCloudsElement = (
  el: HTMLElement | SVGElement,
): boolean => {
  return !el.parentElement?.classList.contains('sky-renderer');
};

export const isBackgroundElement = (el: HTMLElement): boolean => {
  return el.classList.contains('sky-background');
};

export const isLockCloudElement = (el: HTMLElement | SVGElement): boolean => {
  return el.classList.contains('sky-cloud-lock');
};

export const lookUpParentCloudElement = (
  el: HTMLElement | null,
): HTMLElement | null => {
  while (el && !el.dataset.cloudId && !isCloudElement(el)) {
    el = el.parentElement;
  }
  return el;
};

export const lookUpTopCloudElement = (
  el: HTMLElement | null,
): HTMLElement | null => {
  el = lookUpParentCloudElement(el);
  if (!el) return el;

  if (isCloudElementInCloudsElement(el) && el.parentElement) {
    return lookUpTopCloudElement(el.parentElement);
  }

  return el;
};
