import { sky } from '@/plugins/sky';
import { Cloud } from '@packages/sky/editor/plugins/cloud';
import { CLOUD_TYPE, DEFAULT_FONT_FAMILY, WRITING_MODE } from '@/constants';

export interface TextItem {
  text: string;
  [porpname: string]: any;
}

export interface CloudText extends Cloud {
  fontFamily: string;
  fontSize: number;
  textAlign: string;
  color: string;
  textDecoration: string;
  writingMode: string;
  fontWeight: string | number;
  fontStyle: string;
  lineHeight: number;
  shadows: Record<string, unknown>[];
  strokes: Record<string, unknown>[];
  text: string;
  texts: TextItem[];
  type: string;
  letterSpacing: number;
  [propsName: string]: unknown;
}

export default function createTextCloud(props = {}): CloudText {
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
    type: CLOUD_TYPE.text,
    width: 360 * scale,
    height: 60 * scale,
    ...props,
  } as unknown as CloudText;
}
