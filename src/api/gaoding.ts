import httpRequest from '@/plugins/http-request';
import { GAODING } from '@/constants/api';

export const getFonts = async (pageNum: number): Promise<any> => {
  return await httpRequest.get(`${GAODING}/fonts`, {
    params: {
      type: 'font',
      page_size: 100,
      page_num: pageNum,
      region_id: 1,
      biz_code: 1,
      endpoint: 4,
    },
  });
};
