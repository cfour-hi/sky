import httpRequest from '@/plugins/http-request';
import {
  ZNLBWO_XYZ_CORS,
  GAODING_API_V2,
  GAODING_FONTER,
} from '@/constants/api';

export const getFonts = async (pageNum: number): Promise<any> => {
  return await httpRequest.get(`${ZNLBWO_XYZ_CORS}${GAODING_API_V2}/fonts`, {
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

interface GetSubsetFontParams {
  font_id: number;
  content: string;
}

export async function getSubsetFont(params: GetSubsetFontParams) {
  return await httpRequest.get(`${GAODING_FONTER}/subset`, {
    params: {
      from_site: 'gaoding',
      type: 'woff',
      ...params,
    },
    responseType: 'blob',
  });
}
