import skyRendererCSS from '@packages/sky/renderer/index.css?inline';
import skyTextCSS from '@/components/clouds/text/index.css?inline';
import skyImageCSS from '@/components/clouds/image/index.css?inline';

function compression(str: string) {
  return str.replace(/\n+/g, '').replace(/\/\*.+?\*\//g, '');
}

export default compression(skyRendererCSS) +
  compression(skyTextCSS) +
  compression(skyImageCSS);
