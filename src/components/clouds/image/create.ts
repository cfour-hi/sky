import { CLOUD_TYPE } from '@/constants';
import { MIME } from '@/constants/index';
import type { CloudDraft, ImageCloud } from '@packages/sky/editor/plugins/cloud';

const GIFS = [
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210809-162514-cd8e.gif',
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210809-171637-c12e.gif',
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210809-173400-043f.gif',
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210809-172721-5a2d.gif',
  'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210728-175810-8e4f.gif',
];

export type CloudImage = ImageCloud;
export type CreateImageCloudOptions = Partial<Omit<ImageCloud, 'type'>>;

export default function createCloudImage(
  props: CreateImageCloudOptions = {},
): CloudDraft<ImageCloud> {
  return {
    src: GIFS[Math.floor(Math.random() * 5)],
    mime: MIME.gif,
    ...props,
    type: CLOUD_TYPE.image,
  };
}
