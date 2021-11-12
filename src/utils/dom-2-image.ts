import { sky } from '@/plugins/sky';
import { skyRendererStyle } from '@packages/sky/renderer';
import cloudImageCSS from '@/components/clouds/image/index.css';
import cloudTextCSS from '@/components/clouds/text/index.css';
import { generateFontStyle, filterSkyFonts } from '@/utils/font';
import { useFontStore, Font } from '@/stores/font';
import { blob2Base64 } from '@/utils/dataer';
import { CLOUD_TYPE } from '@/constants';
import { decompressFrames, parseGIF, ParsedFrame } from 'gifuct-js';
import { MIME } from '@/constants/index';
import { noop } from '@/utils/tool';
import { getSubsetFont } from '@/api/gaoding';
import { CloudText } from '@/components/clouds/text/create';

// 移除空行和注释
function compression(str: string) {
  return str.replace(/\n+/g, '').replace(/\/\*.+?\*\//g, '');
}

const svgStyle =
  '<style>' +
  compression(skyRendererStyle.default) +
  compression(cloudImageCSS) +
  compression(cloudTextCSS) +
  '</style>';

interface NewParsedFrame extends ParsedFrame {
  newDelay?: number;
}

interface GifData {
  el: HTMLImageElement;
  frames: NewParsedFrame[];
  totalTime: number;
  width: number;
  height: number;
}

interface GenerateImageOptions {
  onProgress: (process: number) => void;
}

const DEFAULT_GIF_DELAY = 50;
const MAX_GIF_FRAME = 100;

export async function generateImage(options: GenerateImageOptions) {
  const onProgress = options.onProgress ?? noop;

  const rootEl = sky.vm.subTree.el.querySelector('.sky-renderer');
  const rootElClone = rootEl.cloneNode(true) as HTMLElement;

  // 一张还是多张
  const gifClouds = sky.state.clouds.filter(
    (cloud) => cloud.type === CLOUD_TYPE.image && cloud.mime === MIME.gif,
  );

  let blob;
  let gifInstance: any;
  if (gifClouds.length === 0) {
    const svg = await dom2Svg(rootElClone);
    onProgress(0.5);
    blob = await svg2ImageBlob(svg);
  } else {
    gifInstance = new (window as any).GIF({ worker: 4, quality: 10 });
    const [gifsData, fontStyles] = await Promise.all([
      toGifsData(),
      toFontStyles(),
    ]);
    onProgress(0.4);

    if (gifClouds.length === 1) {
      // 只要 1 张 Gif 图
      blob = await toGif4Single(gifsData[0], gifsData[0].frames.length, {
        fontStyles,
      });
    } else {
      // 有多张 Gif 图
      const { totalTime, frameLen, delay } = computeGifData(gifsData);
      // 调整每张 gif 图的数据，适配总时长
      adaptGifFrames(gifsData, totalTime);
      onProgress(0.4);
      blob = await toGif4Multiple(gifsData, frameLen, delay, {
        fontStyles,
      });
    }
  }
  onProgress(1);
  return blob;

  function svg2ImageBlob(svg: string) {
    return new Promise((resolve) => {
      const { canvas, ctx } = createCanvas(sky.state.width, sky.state.height);
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          resolve(blob);
          img.remove();
          canvas.remove();
        });
      };
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
  }

  // 生成 Gif 数据
  async function toGifsData() {
    // 所有 cloudImage gif frames
    const gifsData = await Promise.all(
      gifClouds.map(async (cloud) => {
        const sourceFrames = await parseGifFromURL(cloud.src);
        // 目前还不能支持 base64
        // let sourceFrames: ParsedFrame[];
        // if (cloud.src.startsWith('data')) {
        //   // base64
        //   const blob = base642Blob(cloud.src);
        //   sourceFrames = await parseGifFromFile(
        //     new File([blob], `${cloud.id}.gif`, { type: 'image/gif' }),
        //   );
        // } else {
        //   sourceFrames = await parseGifFromURL(cloud.src);
        // }
        const frames = sourceFrames.map((frame) => ({ ...frame, newDelay: 0 }));
        const [frame0] = frames;
        return {
          frames,
          el: rootElClone.querySelector(
            `[data-cloud-id="${cloud.id}"] img.image__content`,
          ) as HTMLImageElement,
          totalTime: frames.reduce((prev, curr) => prev + curr.delay, 0),
          width: frame0.dims.width,
          height: frame0.dims.height,
        };
      }),
    );
    return gifsData;
  }

  async function toFontStyles() {
    const textClouds = sky.state.clouds.filter(
      (cloud) => cloud.type === CLOUD_TYPE.text,
    );

    // 拿到所有文字和对应的字体
    const fontContent: { [propname: string]: string } = {};
    (textClouds as CloudText[]).forEach((cloud) => {
      if (fontContent[cloud.fontFamily]) {
        fontContent[cloud.fontFamily] += cloud.text;
      } else {
        fontContent[cloud.fontFamily] = cloud.text;
      }
    });

    const fontStore = useFontStore();
    await Promise.all(
      // 拿到所有文字所对应字体子集 base64
      Object.keys(fontContent).map(async (key) => {
        const font = fontStore.list.find((font) => font.name === key) as Font;
        const blob = await getSubsetFont({
          font_id: font.id,
          content: fontContent[key],
        });
        const base64 = await blob2Base64(blob as unknown as Blob);
        fontContent[key] = base64;
      }),
    );
    const fontStyles = Object.keys(fontContent).reduce(
      (pre, cur) => pre + generateFontStyle(cur, fontContent[cur]).outerHTML,
      '',
    );
    return fontStyles;
  }

  // 生成 Gif，只有一张 Gif 图的情况
  function toGif4Single(
    gifData: GifData,
    length: number,
    { fontStyles }: { fontStyles?: string } = {},
  ) {
    return new Promise(async (resolve) => {
      const pa = [];
      for (let i = 0; i < length; i += 1) {
        pa.push(addGifFrame(i));
      }
      await Promise.all(pa);

      gifInstance.on('finished', function (blob: Blob) {
        resolve(blob);
      });
      gifInstance.render();

      onProgress(0.8);
    });

    async function addGifFrame(index: number) {
      const frame = getFrameByIndex(index);
      replaceGifElSrc2FrameBase64(gifData, frame);
      const image = await dom2Image(rootElClone, { fontStyles });
      gifInstance.addFrame(image, { delay: frame.delay });
    }

    // 根据索引找到帧数据
    function getFrameByIndex(index: number) {
      const { length } = gifData.frames;
      while (index >= length) {
        index -= length;
      }
      return gifData.frames[index];
    }
  }

  function replaceGifElSrc2FrameBase64(gifData: GifData, frame: ParsedFrame) {
    const { dims, patch } = frame;
    const { canvas, ctx } = createCanvas(gifData.width, gifData.height);
    ctx?.putImageData(
      new ImageData(patch, dims.width, dims.height),
      dims.left,
      dims.top,
    );
    const base64 = canvas.toDataURL();
    gifData.el.src = base64;
  }

  function computeGifData(gifsData: GifData[]) {
    const times = gifsData.map((gif) => gif.totalTime);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const div = maxTime / minTime;

    let totalTime = 0;
    if (div > 2) {
      // 计算最大时长
      totalTime = computeTotalTime(minTime, maxTime);
    } else {
      // 取平均时长
      totalTime = times.reduce((pre, cur) => pre + cur, 0) / times.length;
    }

    let delay = DEFAULT_GIF_DELAY;
    let frameLen = totalTime / delay; // 帧数
    if (frameLen > MAX_GIF_FRAME) {
      delay = delay * (frameLen / MAX_GIF_FRAME);
      frameLen = MAX_GIF_FRAME;
    }
    return { totalTime, frameLen, delay };
  }

  // 计算多张 gif 图的最大时长
  function computeTotalTime(min: number, max: number) {
    const div = max / min;
    // 取小数
    const decimal = div % 1;
    const multiple = decimal > 0.5 ? Math.ceil(div) : Math.floor(div);
    return min * multiple;
  }

  // 调整多张 gif 图的数据，适配总时长
  function adaptGifFrames(gifsData: GifData[], time: number) {
    // 适配时长
    gifsData.forEach((gifData) => {
      const { totalTime, frames } = gifData;
      // 目标时长与当前 gif 图时长的倍数关系
      const multiple = Math.floor(time / totalTime);

      // 目标时长与当前 gif 图时长的差值
      let diff = time - totalTime;
      if (multiple !== 0) {
        diff = (time - multiple * totalTime) / multiple;
      }
      if (diff === 0) return;

      frames.forEach((frame) => {
        // 依据每一帧占比增加时长
        const precent = frame.delay / totalTime;
        frame.delay += diff * precent;
      });

      // 设置适配后的总时长
      gifData.totalTime = Math.round(
        frames.reduce((pre, cur) => pre + cur.delay, 0),
      );
    });
  }

  // 生成 Gif，有多张 Gif 图的情况
  function toGif4Multiple(
    gifsData: GifData[],
    length: number,
    delay: number,
    { fontStyles }: { fontStyles?: string } = {},
  ) {
    return new Promise(async (resolve, reject) => {
      const pa = [];
      for (let i = 0; i < length; i += 1) {
        pa.push(addGifFrame(i));
      }
      await Promise.all(pa);
      onProgress(0.8);

      gifInstance.on('finished', function (blob: Blob) {
        resolve(blob);
      });
      gifInstance.render();
    });

    async function addGifFrame(index: number) {
      const image = await toFrameImage(index);
      gifInstance.addFrame(image, { delay });
    }

    async function toFrameImage(index: number): Promise<HTMLImageElement> {
      gifsData.forEach((gifData) => {
        const frame = getFrameByTime(gifData, index * delay);
        replaceGifElSrc2FrameBase64(gifData, frame);
      });
      return await dom2Image(rootElClone, { fontStyles });
    }

    // 根据时间找到帧数据
    function getFrameByTime(gifData: GifData, time: number) {
      while (time > gifData.totalTime) {
        time -= gifData.totalTime;
      }

      let totalTime = 0;
      let frame;
      for (let i = 0; i < gifData.frames.length; i += 1) {
        totalTime += gifData.frames[i].delay;
        // totalTime 存在小数精度问题
        if (Math.ceil(totalTime) >= time) {
          frame = gifData.frames[i];
          break;
        }
      }
      return frame as NewParsedFrame;
    }
  }
}

export async function dom2Svg(
  el: HTMLElement,
  { fontStyles }: { fontStyles?: string } = {},
) {
  el = el.cloneNode(true) as HTMLElement;
  await convertURLImage2Base64();

  const xmlSerializer = new XMLSerializer();
  const html = xmlSerializer.serializeToString(el);

  return `
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='${sky.state.width}'
      height='${sky.state.height}'
    >
      ${svgStyle}
      ${fontStyles ?? toFontsStyle()}
      <foreignObject
        x='0'
        y='0'
        width='100%'
        height='100%'
      >
        ${html}
      </foreignObject>
    </svg>
  `;

  // 将所有 img.src url 转换为 base64 格式
  function convertURLImage2Base64() {
    const pa: Promise<void>[] = [];
    let elImages = Array.from(
      el.querySelectorAll(
        `[data-cloud-type="${CLOUD_TYPE.image}"] .image__content`,
      ),
    );
    elImages = (elImages as HTMLImageElement[]).filter(
      (el) => !el.src.startsWith('data'),
    );
    if (elImages.length === 0) return;

    elImages.forEach((el) => pa.push(toBase64(el as HTMLImageElement)));
    return Promise.all(pa);

    async function toBase64(img: HTMLImageElement) {
      const { src } = img;
      const base64 = await imageURL2Base64(src);
      img.src = base64;
    }
  }

  // 生成所有字体 style 字符串
  function toFontsStyle() {
    let text = '';
    const fontStore = useFontStore();
    const fonts = filterSkyFonts();
    fonts.forEach((font) => {
      text += generateFontStyle(font, fontStore.download[font]).outerHTML;
    });
    return text;
  }
}

export async function dom2Image(
  el: HTMLElement,
  { fontStyles }: { fontStyles?: string } = {},
): Promise<HTMLImageElement> {
  const svg = await dom2Svg(el, { fontStyles });
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${svg}`;
  });
}

export async function imageURL2Base64(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const base64 = await blob2Base64(blob);
  return base64;
}

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

// 通过 URL 解析 Gif
export function parseGifFromURL(url: string) {
  return fetch(url)
    .then((resp) => resp.arrayBuffer())
    .then((buff) => parseGIF(buff))
    .then((gif) => decompressFrames(gif, true));
}

// export function parseGifFromFile(file: File): Promise<ParsedFrame[]> {
//   return new Promise((resolve, reject) => {
//     const fileReader = new FileReader();
//     fileReader.onload = () => {
//       const gif = parseGIF(fileReader.result as ArrayBuffer);
//       const frames = decompressFrames(gif, true);
//       resolve(frames);
//     };
//     fileReader.onerror = reject;
//     fileReader.readAsArrayBuffer(file);
//   });
// }
