import { sky } from '@/plugins/sky';
import { CloudText } from '@/components/clouds/text/create';
import { CLOUD_TYPE } from '@/constants';

// https://www.zhangxinxu.com/wordpress/2018/02/js-detect-suppot-font-family/
export const isSupportFontFamily = (f: string) => {
  if (typeof f != 'string') {
    return false;
  }
  const h = 'Arial';
  if (f.toLowerCase() == h.toLowerCase()) {
    return true;
  }
  const e = 'a';
  const d = 100;
  const a = 100;
  const i = 100;
  const c = document.createElement('canvas');
  const b = c.getContext('2d') as CanvasRenderingContext2D;

  c.width = a;
  c.height = i;

  b.textAlign = 'center';
  b.fillStyle = 'black';
  b.textBaseline = 'middle';

  const g = (j: string) => {
    b.clearRect(0, 0, a, i);
    b.font = d + 'px ' + j + ', ' + h;
    b.fillText(e, a / 2, i / 2);
    const k = b.getImageData(0, 0, a, i).data;
    return [].slice.call(k).filter((l) => {
      return l != 0;
    });
  };
  return g(h).join('') !== g(f).join('');
};

// 生成字体 style
export function generateFontStyle(name: string, url: string): HTMLStyleElement {
  const el = document.createElement('style');
  el.id = name;
  // el.classList.add('font-face');
  el.innerHTML = `@font-face { font-family: "${name}"; src: local("${name}"), url("${url}"); }`;
  return el;
}

// 找到使用到的所有字体
export function filterSkyFonts() {
  const fonts: string[] = [];
  const textClouds = sky.state.clouds.filter(
    (cloud) => cloud.type === CLOUD_TYPE.text,
  );

  (textClouds as unknown as CloudText[]).forEach((cloud) => {
    // 找到文字组件字体
    if (cloud.fontFamily && !fonts.includes(cloud.fontFamily)) {
      fonts.push(cloud.fontFamily);
    }
    // 找到文字组件子级字体
    cloud.texts.forEach((text) => {
      if (text.fontFamily && !fonts.includes(text.fontFamily)) {
        fonts.push(text.fontFamily);
      }
    });
  });
  return fonts;
}
