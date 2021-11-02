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
