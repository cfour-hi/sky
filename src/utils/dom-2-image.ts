import { sky } from '@/plugins/sky';
import { skyRendererStyle } from '@packages/sky/renderer';
import cloudImageCSS from '@/components/clouds/image/index.css';
import cloudTextCSS from '@/components/clouds/text/index.css';
import { generateFontStyle } from '@/utils/font';
import { useFontStore } from '@/stores/font';
import { blob2B64 } from './dataer';
import { CLOUD_TYPE } from '@/constants';
import { decompressFrames, parseGIF, ParsedFrame } from 'gifuct-js';
import { filterSkyFonts } from './font';

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

// const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
// svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
// svg.setAttribute('width', el.clientWidth);
// svg.setAttribute('height', el.clientHeight);

// const style = document.createElement('style');
// style.innerText = svgStyle;

// const foreighObject = document.createElementNS(
//   'http://www.w3.org/2000/svg',
//   'foreignObject',
// );
// foreighObject.setAttribute('x', 0);
// foreighObject.setAttribute('y', 0);
// foreighObject.setAttribute('width', '100%');
// foreighObject.setAttribute('height', '100%');
// foreighObject.innerHTML = new XMLSerializer().serializeToString(
//   el.cloneNode(true),
// );

// svg.appendChild(style);
// svg.appendChild(foreighObject);

// return svg;

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

const DEFAULT_GIF_DELAY = 50;
const MAX_GIF_FRAME = 100;

export async function generateImage() {
  const rootEl = sky.vm.subTree.el.querySelector('.sky-renderer');
  const rootElClone = rootEl.cloneNode(true) as HTMLElement;

  // 一张还是多张
  const gifClouds = sky.state.clouds.filter(
    (cloud) => cloud.type === CLOUD_TYPE.image && cloud.src.endsWith('.gif'),
  );

  let blob;
  if (gifClouds.length === 0) {
    const svg = await dom2Svg(rootElClone);
    blob = await svg2ImageBlob(svg);
  } else {
    const gifsData = await toGifsData();

    if (gifClouds.length === 1) {
      // 只要 1 张 Gif 图
      blob = await toGif4Single(
        rootElClone,
        gifsData[0],
        gifsData[0].frames.length,
      );
    } else {
      // 有多张 Gif 图
      const { totalTime, frameLen, delay } = computeGifData(gifsData);
      // 调整多张 gif 图的数据，适配总时长
      adaptGifFrames(gifsData, totalTime);
      // 重新生成帧数据
      regenerateFrameData(gifsData);
      blob = await toGif4Multiple(rootElClone, gifsData, frameLen, delay);
    }
  }

  return blob;

  function svg2ImageBlob(svg: string) {
    return new Promise((resolve) => {
      const el = document.querySelector('.sky-renderer') as HTMLElement;
      const { canvas, ctx } = createCanvas(el.clientWidth, el.clientHeight);

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

  // 通过 URL 解析 Gif
  function parseGifFromURL(url: string) {
    return fetch(url)
      .then((resp) => resp.arrayBuffer())
      .then((buff) => parseGIF(buff))
      .then((gif) => decompressFrames(gif, true));
  }

  // 生成 Gif，只有一张 Gif 图的情况
  function toGif4Single(el: HTMLElement, gifData: GifData, length: number) {
    const gif = new (window as any).GIF({ worker: 2, quality: 10 });
    return new Promise(async (resolve) => {
      const pa = [];
      for (let i = 0; i < length; i += 1) {
        pa.push(addGifFrame(i));
      }
      await Promise.all(pa);

      gif.on('finished', function (blob: Blob) {
        console.log(URL.createObjectURL(blob));
        resolve(blob);
      });
      gif.render();
    });

    async function addGifFrame(index: number) {
      const { canvas, ctx } = createCanvas(sky.state.width, sky.state.height);
      const frame = getFrameByIndex(index);
      const image = await toFrameImage(frame);

      ctx?.drawImage(image, 0, 0, sky.state.width, sky.state.height);
      gif.addFrame(canvas, { delay: frame.delay });
    }

    // 根据索引找到帧数据
    function getFrameByIndex(index: number) {
      const { length } = gifData.frames;
      while (index >= length) {
        index -= length;
      }
      return gifData.frames[index];
    }

    async function toFrameImage(frame: ParsedFrame): Promise<HTMLImageElement> {
      const { dims, patch } = frame;
      const { canvas, ctx } = createCanvas(gifData.width, gifData.height);
      ctx?.putImageData(
        new ImageData(patch, dims.width, dims.height),
        dims.left,
        dims.top,
      );
      const base64 = canvas.toDataURL();
      gifData.el.src = base64;

      const image = await dom2Image(el);
      return image as HTMLImageElement;
    }
  }

  function computeGifData(gifsData: GifData[]) {
    const times = gifsData.map((gif) => gif.totalTime);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    // 是否成倍数关系
    const hasMultiple = maxTime / minTime > 2;
    let totalTime = 0;
    if (hasMultiple) {
      // 计算最大时长
      totalTime = computeTotalTime(minTime, maxTime);
    } else {
      // 取平均时长
      totalTime = times.reduce((pre, cur) => pre + cur, 0) / times.length;
    }
    let delay = DEFAULT_GIF_DELAY;
    // 帧数
    let frameLen = totalTime / delay;
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
    gifsData.forEach((gif) => {
      const { totalTime } = gif;
      let diff = time - totalTime;
      // 目标时长与当前 gif 图时长的倍数关系
      const multiple = Math.floor(time / totalTime);
      // 目标时长与当前 gif 图时长的差值
      if (multiple !== 0) {
        diff = (time - (multiple - 1) * totalTime - totalTime) / multiple;
      }

      if (diff === 0) return;

      gif.frames.forEach((frame) => {
        // 依据每一帧占比增加时长
        const precent = frame.delay / totalTime;
        frame.delay += diff * precent;
      });
      // 设置适配后的总时长
      gif.totalTime = Math.round(
        gif.frames.reduce((pre, cur) => pre + cur.delay, 0),
      );
    });
  }

  // 重新生成帧数据
  function regenerateFrameData(gifsData: GifData[]) {
    // 以每帧 50ms 为标准计算新的帧数据
    gifsData.forEach((gif) => {
      let time = 0;
      const newFrames: NewParsedFrame[] = [];
      while (time < gif.totalTime) {
        const frame = findFrame(gif.frames, time);
        const { length } = newFrames;
        // 当前帧与前一帧是同一帧
        if (length > 0 && frame === newFrames[length - 1]) {
          (frame.newDelay as number) += DEFAULT_GIF_DELAY;
        } else {
          frame.newDelay = DEFAULT_GIF_DELAY;
          newFrames.push(frame);
        }
        time += DEFAULT_GIF_DELAY;
      }
      newFrames.forEach((frame) => {
        frame.delay = frame.newDelay as number;
        Reflect.deleteProperty(frame, 'newDelay');
      });
      gif.frames = newFrames;
    });
  }

  // 生成 Gif，有多张 Gif 图的情况
  function toGif4Multiple(
    el: HTMLElement,
    gifsData: GifData[],
    length: number,
    delay: number,
  ) {
    const gif = new (window as any).GIF({ worker: 2, quality: 10 });
    return new Promise(async (resolve, reject) => {
      const pa = [];
      for (let i = 0; i < length; i += 1) {
        pa.push(addGifFrame(i));
      }
      await Promise.all(pa);

      gif.on('finished', function (blob: Blob) {
        console.log(URL.createObjectURL(blob));
        resolve(blob);
      });
      gif.render();
    });

    async function addGifFrame(index: number) {
      const { canvas, ctx } = createCanvas(sky.state.width, sky.state.height);
      const image = await toFrameImage(index);
      ctx?.drawImage(image, 0, 0, sky.state.width, sky.state.height);
      gif.addFrame(canvas, { delay });
    }

    async function toFrameImage(index: number): Promise<HTMLImageElement> {
      gifsData.forEach((gifData) => {
        const { el, frames } = gifData;
        const frame = getFrameByTime(gifData, index * delay);
        const { dims, patch } = frame;
        const { canvas, ctx } = createCanvas(gifData.width, gifData.height);

        ctx?.putImageData(
          new ImageData(patch, dims.width, dims.height),
          dims.left,
          dims.top,
        );
        const base64 = canvas.toDataURL();
        el.src = base64;
      });
      const image = await dom2Image(el);
      return image as HTMLImageElement;

      function getFrameByTime(gifData: GifData, time: number) {
        if (time >= gifData.totalTime) {
          const div = Math.floor(time / gifData.totalTime);
          time = time - gifData.totalTime * div;
        }
        return findFrame(gifData.frames, time);
      }
    }
  }

  // 根据时间找到帧数据
  function findFrame(frames: NewParsedFrame[], time: number) {
    let totalTime = 0;
    let frame;
    for (let i = 0; i < frames.length; i += 1) {
      totalTime += frames[i].delay;
      if (totalTime > time) {
        frame = frames[i];
        break;
      }
    }
    return frame as NewParsedFrame;
  }
}

export async function dom2Svg(el: HTMLElement) {
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
      ${toFontsStyle()}
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

export async function dom2Image(el: HTMLElement) {
  const svg = await dom2Svg(el);
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
  const base64 = await blob2B64(blob);
  return base64;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

// export function parseGifFromFile(file: File) {
//   return new Promise((resolve, reject) => {
//     const fileReader = new FileReader();
//     fileReader.onload = () => {
//       const gif = parseGIF(fileReader.result as ArrayBuffer);
//       const frames = decompressFrames(gif, true);
//       return frames;
//     };
//     fileReader.onerror = reject;
//     fileReader.readAsArrayBuffer(file);
//   });
// }
