import { Cloud } from '@packages/sky/editor/plugins/cloud';
import { n2px } from '../tool';

export const toCloudReflowStyle = (cloud: Cloud) => {
  // const { a, b, c, d, tx, ty } = cloud.transform;
  // const matrix = [a, b, c, d, tx, ty];
  const style = {
    width: n2px(cloud.width),
    height: n2px(cloud.height),
    top: n2px(cloud.top),
    left: n2px(cloud.left),
    transform: cloud.transform,
  };
  return style;
};
