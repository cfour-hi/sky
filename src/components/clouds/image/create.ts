import { Cloud } from '@packages/sky/editor/plugins/cloud';
import { CLOUD_TYPE } from '@/constants';
import logo from '@/assets/logo.png';

const GIFS = [
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210809-162514-cd8e.gif',
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210809-171637-c12e.gif',
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210809-173400-043f.gif',
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210809-172721-5a2d.gif',
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210728-175810-8e4f.gif',
];

export interface CloudImage extends Cloud {
  src: string;
  [propsName: string]: unknown;
}

export default function createCloudImage(props = {}): CloudImage {
  return {
    src: GIFS[Math.floor(Math.random() * 5)],
    type: CLOUD_TYPE.image,
    ...props,
  } as CloudImage;
}
