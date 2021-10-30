import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { getFonts } from '@/api/gaoding';
import { blob2B64 } from '@/utils/dataer';
import { generateFontStyle, isSupportFontFamily } from '@/utils/font';

export interface Font {
  name: string;
  content: {
    woff: string;
  };
  preview: {
    url: string;
  };
}

interface State {
  list: Font[];
  download: {
    // fontFamily: base64
    [propname: string]: any;
  };
}

export const useFontStore = defineStore('font', {
  state: (): State => ({
    list: [],
    download: {},
  }),

  // optional actions
  actions: {
    async fetch() {
      this.list = [];

      const localFonts: any = useLocalStorage('SKY_FONTS', []);
      if (localFonts.value.length > 0) {
        this.list.push(...localFonts.value);
      }

      if (this.list.length === 0) {
        for (let i = 1; i < 99; i += 1) {
          const res = await getFonts(i);
          this.list.push(...res);
          if (res.length < 100) break;
        }

        localFonts.value = this.list;
      }
    },

    async addFont2Style(name: string, url: string) {
      if (this.download[name]) return;
      if (isSupportFontFamily(name)) return;

      const response = await fetch(url, { headers: { responseType: 'blob' } });
      const blob = await response.blob();
      const b64 = await blob2B64(blob);

      // 使用 base64 是为了方便将 DOM 生成图片
      this.download[name] = b64;

      // const ff = new FontFace(name, `url(${URL.createObjectURL(blob)})`);
      // const f = await ff.load();
      // (document.fonts as FontFaceSet).add(f);

      document.head.appendChild(generateFontStyle(name, b64));
    },
  },
});
