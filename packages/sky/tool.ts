const { toString, hasOwnProperty } = Object.prototype;

/**
 * 获取值的原始类型
 */
export const toRawType = (v: unknown): string => toString.call(v).slice(8, -1);

/**
 * 检车对象是否自有属性
 */
export const hop = (o: Record<string, unknown>, k: string): boolean =>
  hasOwnProperty.call(o, k);

/**
 * 生成有规律的随机码
 */
export const genRandomCode = (): string =>
  Date.now().toString(36) +
  Math.random()
    .toString(36)
    .slice(2, 9);

export const n2px = (n: number | string): string => {
  if (toRawType(n) === 'Number') {
    return `${n}px`;
  }
  return n as string;
};

export const px2n = (px: string | number): number => {
  if (toRawType(px) === 'String') {
    return parseFloat(px as string);
  }
  return px as number;
};

export const assign = (
  to: Record<string, unknown>,
  from: Record<string, unknown>,
): void => {
  Object.keys(to).forEach(k => {
    if (hop(from, k)) {
      to[k] = from[k];
    }
  });
};

export const sleep = (time = 0): Promise<undefined> => {
  return new Promise(resolve => setTimeout(resolve, time));
};

export const difference = <T>(a: T[], b: T[]): T[] =>
  a.filter(item => !b.includes(item));

export const uniq = <T>(a: T[]): T[] =>
  a.filter((item, idx, arr) => arr.indexOf(item) === idx);

export const isEqualArray = <T>(a: T[], b: T[]): boolean =>
  a.length === b.length && uniq([...a, ...b]).length === a.length;

export const restoreSize = (size: number, scale: number) => size / scale;

export const scaleSize = (size: number, scale: number) => size * scale;

export const scaleSize4Pre = (size: number, preScale: number, scale: number) =>
  scaleSize(restoreSize(size, preScale), scale);

export const withCtrlOrShiftKey = (event: MouseEvent) =>
  event.metaKey || event.shiftKey || event.ctrlKey;
