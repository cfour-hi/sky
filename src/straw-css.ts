import skyRendererCSS from '@packages/sky/renderer/index.css';
import skyTextCSS from '@/components/clouds/text/index.css';
import skyImageCSS from '@/components/clouds/image/index.css';

function compression(str: string) {
  return str.replace(/\n+/g, '').replace(/\/\*.+?\*\//g, '');
}

export default compression(skyRendererCSS) +
  compression(skyTextCSS) +
  compression(skyImageCSS);
