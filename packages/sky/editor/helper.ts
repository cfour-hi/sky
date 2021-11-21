import { SKY_CLOUD_LOCK } from '../constants';

export const isCloudElement = (cloud: HTMLElement | SVGElement): boolean => {
  return cloud.classList.contains('sky-cloud');
};

export const isCloudElementInCloudsElement = (
  el: HTMLElement | SVGElement,
): boolean => {
  return !el.parentElement?.classList.contains('sky-renderer');
};

export const isBackgroundElement = (
  el: HTMLElement | null | undefined,
): boolean => {
  if (el) {
    return el.classList.contains('sky-background');
  }
  return false;
};

export const isLockCloudElement = (el: HTMLElement | SVGElement): boolean => {
  return el.classList.contains(SKY_CLOUD_LOCK);
};

export const lookUpParentCloudElement = (
  el: HTMLElement | null,
): HTMLElement | null => {
  while (el && !el.dataset.cloudId && !isCloudElement(el)) {
    el = el.parentElement;
    // 找到 sky-renderer 就不找了
    if (el?.classList.contains('sky-renderer')) return null;
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
