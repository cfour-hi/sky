// import { CloudText } from './type';
import { TextItem } from './create';

// interface ProxyCloud extends CloudText {
//   isMultipleColor?: boolean;
// }

export function getTextSelection() {
  const selection = document.getSelection() as Selection;
  let { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

  function exchangeOffset() {
    anchorOffset = selection.focusOffset;
    focusOffset = selection.anchorOffset;
  }

  // span 元素
  let anchorEl = anchorNode?.parentElement as HTMLElement;
  let focusEl = focusNode?.parentElement as HTMLElement;

  const elTextContent = anchorEl?.parentElement;
  const spans = Array.from((elTextContent as HTMLElement).children);

  let anchorElIndex = spans.indexOf(anchorEl);
  let focusElIndex = spans.indexOf(focusEl);

  // 不同节点从右往左选的情况
  if (anchorElIndex > focusElIndex) {
    anchorElIndex = focusElIndex;
    focusElIndex = spans.indexOf(anchorEl);

    anchorEl = focusEl;
    focusEl = anchorNode?.parentElement as HTMLElement;

    exchangeOffset();
  } else if (anchorElIndex === focusElIndex) {
    // 相同节点从右往左选
    if (anchorOffset > focusOffset) {
      exchangeOffset();
    }
  }

  return {
    selection,
    elTextContent,
    anchorEl,
    anchorElIndex,
    focusEl,
    focusElIndex,
    anchorOffset,
    focusOffset,
  };
}

export function splitText(text: TextItem, start: number, end: number) {
  const a = { ...text };
  const b = { ...text };
  const c = { ...text };
  a.text = text.text.slice(0, start);
  b.text = text.text.slice(start, end);
  c.text = text.text.slice(end);
  const abc = [];
  if (start !== 0) abc.push(a);
  abc.push(b);
  if (end !== text.text.length) abc.push(c);
  return abc;
}

export function setRange(
  start: Node,
  startOffset: number,
  end: Node,
  endOffset: number,
) {
  const range = new Range();
  range.setStart(start, startOffset);
  range.setEnd(end, endOffset);

  (window as any).getSelection().removeAllRanges();
  (window as any).getSelection().addRange(range);
}
