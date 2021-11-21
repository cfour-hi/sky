# Sky

> Sky 即 “天空”，把天空比作画布。

- 功能、UI 风格抄袭 @稿定设计，追求品质；
- packages/sky-ui 是基础 UI 库；
- packages/sky 是基于 [moveable](https://github.com/daybrush/moveable) 封装的交互插件，面向未来可快速实现 GIF、H5、PPT 编辑器；
- 使用 [psd.js](https://github.com/meltingice/psd.js) 解析 PSD 文件，目前只做到最最最基本的还原，很不理想。看啥时候能啃下来 [Adobe Photoshop
  File Formats](https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/)；
- 使用 [gifuct-js](https://github.com/matt-way/gifuct-js) 解析 GIF，使用 [gif.js](https://github.com/jnordberg/gif.js/) 生成 GIF。做了些处理，生成速度贼快。
- 调用了 @稿定设计 的一些接口；

## 技术栈

- [Vite](https://github.com/vitejs/vite)
- [Vue@3](https://github.com/vuejs/vue-next)
- [Pinia](https://github.com/posva/pinia)
- [VueUse](https://github.com/vueuse/vueuse)
- [TypeScript](https://github.com/microsoft/TypeScript)
- [TailwindCSS](https://github.com/tailwindlabs/tailwindcss)
- [Sass](https://github.com/sass/sass)

## TODO

### 基础

- [ ] 编辑画布尺寸
- [x] 画布背景
- [ ] 右键菜单
- [x] 图层锁定、复制、删除、不透明度
- [x] 图层交互，可拖动、可修改尺寸、可旋转
- [x] 重叠图层
- [x] 图层打组
- [x] 图层组对齐
- [x] 文字字体、尺寸、粗细、斜体、下划线、删除线、对齐、颜色、字间距、行间距、方向
- [ ] 文字描边、阴影、填充、变形
- [x] 文字局部修改
- [ ] 图片蒙版

### 进阶

- [ ] PSD 解析、还原
- [x] 图层框选、等比缩放
- [x] 图层移动吸附、参考线
- [x] 文字尺寸、字间距随图层大小而改变
- [x] 文字横向不可纵向拉伸，文字纵向不可横向拉伸
- 文字编辑，可修改局部样式
  - 文字换行还有问题
  - 未知
- [ ] PNG 图透明背景点击穿透
