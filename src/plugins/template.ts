import { SkyState } from '@packages/sky/editor/index';

const SKY_DATA = 'SKY_DATA';

export const loadLocalTemplateData = () => {
  const data = localStorage.getItem(SKY_DATA);
  if (!data) return;

  return JSON.parse(data);
};

export const saveTemplate2Local = (data: SkyState) => {
  localStorage.setItem(SKY_DATA, JSON.stringify(data));
};
