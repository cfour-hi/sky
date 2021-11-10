import { CLOUD_TYPE, WRITING_MODE } from '@/constants';
import { colorer } from '@packages/sky-ui/main';

export async function parsePSDFromURL(url: string) {
  return await (window as any).PSD.fromURL(url);
}

function toRGBAColor(data: number[]) {
  const [r, g, b] = data;
  let [, , , a] = data;
  if (a > 1) {
    a = a / 255;
  }
  return [r, g, b, a] as const;
}

function toRGBAColor1(data: number[]) {
  const [a, b, g, r] = data;
  return [r * 255, g * 255, b * 255, a] as const;
}

const STROKE_TYPE = {
  InsF: 'inner',
  CtrF: 'center',
  OutF: 'outer',
};

function calcTransform({ xx, xy }: { xx: number; xy: number }): {
  scale: number;
  angle: number;
} {
  /**
   * xx yx tx
   * xy yy ty
   * 0  0  1
   */
  const scale = Math.sqrt(xx * xx + xy * xy);
  const angle = (Math.asin(xy / scale) * 180) / Math.PI;
  return { scale, angle };
}

function toTransformMatrix({
  xx,
  xy,
  yx,
  yy,
  tx,
  ty,
}: {
  xx: number;
  xy: number;
  yx: number;
  yy: number;
  tx: number;
  ty: number;
}) {
  return { a: xx, b: xy, c: yx, d: yy, tx, ty };
}

function toCloudTextConfig(data: any, layer: any) {
  // console.info('toCloudTextConfig', layer);

  const { objectEffects, typeTool } = layer.adjustments;
  const { StyleRun } = typeTool.engineData.EngineDict;

  let point = 0;
  const texts = StyleRun.RunArray.map((text: any, index: number) => {
    const length = StyleRun.RunLengthArray[index];
    const props: { text: string; fontSize: number; color?: string } = {
      text: data.text.value.substr(point, length),
      fontSize: text.StyleSheet.StyleSheetData.FontSize,
    };
    const { FillColor } = text.StyleSheet.StyleSheetData;
    if (FillColor) {
      props.color = colorer.RGBA2HexA(...toRGBAColor1(FillColor.Values));
    }
    point += length;
    return props;
  });

  const strokes = [];
  const shadows = [];
  if (objectEffects) {
    const { FrFX, DrSh } = objectEffects.data;

    if (FrFX) {
      strokes.push({
        type: Reflect.get(STROKE_TYPE, FrFX.Styl.value),
        width: FrFX['Sz  '].value,
        color: [
          FrFX['Clr ']['Rd  '],
          FrFX['Clr ']['Grn '],
          FrFX['Clr ']['Bl  '],
          FrFX.Opct.value / 100,
        ],
      });
    }

    if (DrSh) {
      shadows.push({
        color: [
          DrSh['Clr ']['Rd  '],
          DrSh['Clr ']['Grn '],
          DrSh['Clr ']['Bl  '],
          DrSh.Opct.value / 100,
        ],
        distance: DrSh.Dstn.value,
        blur: DrSh.blur.value,
        angle: DrSh.lagl.value,
      });
    }
  }

  const { angle } = calcTransform(typeTool.transform);

  return {
    type: CLOUD_TYPE.text,
    width: data.width,
    height: data.height,
    top: data.top,
    left: data.left,
    text: data.text.value,
    opacity: data.opacity,
    textAlign: data.text.font.alignment[0],
    // fontFamily: typeTool
    //   .fonts()
    //   .map((font: string) => font.slice(1).replace('\u0000', '')),
    fontFamily: typeTool.fonts()[0].slice(1).replace('\u0000', ''),
    fontSize: data.text.font.sizes[0],
    color: colorer.RGBA2HexA(...toRGBAColor(data.text.font.colors[0])),
    textDecoration: StyleRun.RunArray[0].StyleSheet.StyleSheetData.Underline
      ? 'underline'
      : '',
    writingMode:
      typeTool.obj.textData.Ornt.value === 'Hrzn'
        ? WRITING_MODE.h
        : WRITING_MODE.v,
    fontWeight: '',
    fontStyle: '',
    texts,
    strokes,
    shadows,
    angle,
    transform: toTransformMatrix(typeTool.transform),
  };
}

function toCloudImageConfig(data: any, layer: any) {
  // const { type, b64 } = splitBase64(layer.image.toBase64());
  // const src = URL.createObjectURL(b64toBlob(b64, type));

  return {
    src: layer.image.toBase64(),
    type: CLOUD_TYPE.image,
    width: data.width,
    height: data.height,
    top: data.top,
    left: data.left,
    opacity: data.opacity,
  };
}

function toCloud(data: any, layer: any) {
  if (layer.typeTool) {
    return toCloudTextConfig(data, layer);
  } else {
    return toCloudImageConfig(data, layer);
  }
}

export async function convertPSD2Sky(psd: any) {
  const { children, document: doc } = psd.tree().export();

  const findLayer = (data: any) => {
    return psd.layers.find(
      (layer: any) =>
        layer.name === data.name &&
        layer.top === data.top &&
        layer.right === data.right &&
        layer.bottom === data.bottom &&
        layer.left === data.left &&
        layer.width === data.width &&
        layer.height === data.height,
    );
  };

  // eslint-ignore-next-line
  // console.info('children, document', psd, children, doc);

  const background = {
    color: '#ffffff00',
    image: '',
    opacity: 1,
  };
  const [bgData] = children.slice(-1);
  if (['Background', 'background', '背景'].includes(bgData.name)) {
    const layer = findLayer(bgData);
    const image = toCloudImageConfig(bgData, layer);
    background.opacity = image.opacity;
    background.image = image.src;

    children.pop();
  }

  const sky = {
    background,
    width: doc.width,
    height: doc.height,
    clouds: [],
  };

  const process = (children: any) => {
    children.forEach((item: any) => {
      if (item.type === 'group' && Array.isArray(item.children)) {
        return process(item.children);
      }

      const layer = findLayer(item);
      if (!layer) return;

      const cloud = toCloud(item, layer);
      sky.clouds.unshift(cloud as never);
    });
  };

  process(children);

  return sky;
}

export async function processPSD2Sky(file: File) {
  const url = URL.createObjectURL(file);
  const psd = await parsePSDFromURL(url);

  URL.revokeObjectURL(url);

  return convertPSD2Sky(psd);
}
