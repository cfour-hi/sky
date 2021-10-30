export const adaptiveZoom = (
  targetWidth: number,
  targetHeight: number,
): number => {
  const { clientWidth, clientHeight } = document.querySelector(
    '.app-main',
  ) as HTMLElement;

  let containerSize = clientWidth;
  let targetSize = targetWidth;

  const widthRatio = targetWidth / clientWidth;
  const heightRatio = targetHeight / clientHeight;
  if (heightRatio > widthRatio) {
    containerSize = clientHeight;
    targetSize = targetHeight;
  }

  let scale = containerSize / (targetSize + 40);
  scale = Math.floor((scale / 5) * 100);
  scale = (scale * 5) / 100;

  return scale;
};
