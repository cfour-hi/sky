// 1. 确保在声明补充的类型之前导入 'vue'
import { Sky } from '@packages/sky/editor';

// interface PSDClass {
//   fromEvent: (event: Event) => Promise<unknown>;
// }

// declare const PSD: PSDClass;

declare module '@vue/runtime-core' {
  export interface ComponentInternalInstance {
    $sky: Sky;
  }
}
