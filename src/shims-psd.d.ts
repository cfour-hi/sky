interface TreeItem {
  blendingMode: string;
  bottom: number;
  height: number;
  image: object;
  left: number;
  mask: object;
  name: string;
  opacity: number;
  right: number;
  text: object;
  top: number;
  type: string;
  visible: boolean;
  width: number;
}

interface PSDTypeToolTransform {
  tx: number;
  ty: number;
  xx: number;
  xy: number;
  yx: number;
  yy: number;
}

interface TransformMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}
