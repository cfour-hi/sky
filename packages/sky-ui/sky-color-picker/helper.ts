export const parseBackgroundValue = (value: string): string => {
  if (value.startsWith('#')) return '纯色';
  if (value.startsWith('linear-gradient')) return '渐变';
  return '图案';
};

interface Stop {
  color: string;
  offset: number;
}

export const toGradientString = (angle: number, stops: Stop[]) => {
  const s: string[] = [];
  stops.forEach((stop) => {
    s.push(`${stop.color} ${stop.offset * 100}%`);
  });
  return `linear-gradient(${angle}deg, ${s.join(',')})`;
};

export default function dom2Svg(
  el: HTMLElement,
  { css = '' }: { css?: string } = {},
) {
  const cloneNode = el.cloneNode(true);
  const xmlSerializer = new XMLSerializer();
  const html = xmlSerializer.serializeToString(cloneNode);

  return `<svg xmlns='http://www.w3.org/2000/svg' width='${el.clientWidth}' height='${el.clientHeight}'><style>${css}</style><foreignObject x='0' y='0' width='100%' height='100%'>${html}</foreignObject></svg>`;
}

export async function dom2Image(
  el: HTMLElement,
  { css = '' }: { css?: string } = {},
): Promise<unknown> {
  const svg = dom2Svg(el, { css });
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = (e) => {
      resolve(e.target);
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${svg}`;
  });
}
