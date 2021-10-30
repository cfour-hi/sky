import { CloudText } from '@/types/cloud';
import { sky } from '@/plugins/sky';
import { skyRendererStyle } from '@packages/sky/renderer';
import cloudImageCSS from '@/components/clouds/image/index.css';
import cloudTextCSS from '@/components/clouds/text/index.css';
import { generateFontStyle } from '@/utils/font';
import { useFontStore } from '@/stores/font';

function compression(str: string) {
  return str.replace(/\n+/g, '').replace(/\/\*.+?\*\//g, '');
}

const svgCSS =
  compression(skyRendererStyle.default) +
  compression(cloudImageCSS) +
  compression(cloudTextCSS);

function toFontCssText() {
  let text = '';
  const textClouds = sky.state.clouds.filter((cloud) => cloud.type === 'text');
  const fontnames = [
    ...new Set(textClouds.map((cloud) => (cloud as CloudText).fontFamily)),
  ];
  const fontStore = useFontStore();
  fontnames.forEach((name) => {
    text += generateFontStyle(name, fontStore.download[name]).outerHTML;
  });
  return text;
}

export function dom2Svg(el: HTMLElement) {
  // const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  // svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // svg.setAttribute('width', el.clientWidth);
  // svg.setAttribute('height', el.clientHeight);

  // const style = document.createElement('style');
  // style.innerText = svgCSS;

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

  // const el = document.querySelector('.sky-renderer') as HTMLElement;
  const cloneNode = el.cloneNode(true);
  const xmlSerializer = new XMLSerializer();
  const html = xmlSerializer.serializeToString(cloneNode);

  return `
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='${el.clientWidth}'
      height='${el.clientHeight}'
    >
      <style>
      </style>
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
}

export async function dom2Image(el: HTMLElement) {
  const svg = dom2Svg(el);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${svg}`;
  });
}

export function svg2Blob(svg: string) {
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
}

export function svg2ImageBlob(svg: string) {
  return new Promise((resolve) => {
    const el = document.querySelector('.sky-renderer') as HTMLElement;
    const canvas = document.createElement('canvas');
    canvas.width = el.clientWidth;
    canvas.height = el.clientHeight;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        resolve(blob);

        img.remove();
        canvas.remove();
      });
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export function downloadBlob(
  blob: Blob,
  { filename = Date.now().toString() } = {},
) {
  if (navigator && (navigator as any).msSaveOrOpenBlob) {
    return (navigator as any).msSaveOrOpenBlob(blob);
  }

  // For other browsers:
  // Create a link pointing to the ObjectURL containing the blob.
  const blobURL = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobURL;
  link.download = filename;

  // this is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );

  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    URL.revokeObjectURL(blobURL);
    link.remove();
  }, 100);
}
