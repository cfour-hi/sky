import { CLOUD_TYPE } from '@/constants';
import logo from '@/assets/logo.png';

export interface CloudImagePrivate {
  src: string;
  [propsName: string]: unknown;
}

export default function createCloudImage(props = {}): CloudImagePrivate {
  return {
    src: logo,
    type: CLOUD_TYPE.image,
    ...props,
  };
}
