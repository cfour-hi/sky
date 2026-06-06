import { sky } from '@/plugins/sky';
import { CLOUD_TYPE, DEFAULT_FONT_FAMILY, WRITING_MODE } from '@/constants';
import type {
  CloudDraft,
  TextCloud,
  TextItem,
} from '@packages/sky/editor/plugins/cloud';

export type CloudText = TextCloud;
export type { TextItem };
export type CreateTextCloudOptions = Partial<Omit<TextCloud, 'type'>>;

export default function createTextCloud(
  props: CreateTextCloudOptions = {},
): CloudDraft<TextCloud> {
  const { scale } = sky.state;
  return {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 60,
    textAlign: 'left',
    color: `#000000ff`,
    textDecoration: 'none',
    writingMode: WRITING_MODE.h,
    fontWeight: 400,
    fontStyle: 'normal',
    lineHeight: 1,
    letterSpacing: 0,
    shadows: [],
    strokes: [],
    text: '点击编辑文字',
    texts: [{ text: '点击编辑文字' }],
    width: 360 * scale,
    height: 60 * scale,
    ...props,
    type: CLOUD_TYPE.text,
  };
}
