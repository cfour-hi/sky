export function noop() {}

export function hasDiffValue(list: any[], key: string, value: any) {
  if (value === undefined) value = list[0][key];
  return list.some((item) => item[key] !== value);
}

export function hasSameValue(list: any[], key: string, value: any) {
  if (value === undefined) value = list[0][key];
  return list.every((item) => item[key] === value);
}

// export function svg2Blob(svg: string) {
//   return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
// }

// export function downloadBlob(
//   blob: Blob,
//   { filename = Date.now().toString() } = {},
// ) {
//   if (navigator && (navigator as any).msSaveOrOpenBlob) {
//     return (navigator as any).msSaveOrOpenBlob(blob);
//   }

//   // For other browsers:
//   // Create a link pointing to the ObjectURL containing the blob.
//   const blobURL = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = blobURL;
//   link.download = filename;

//   // this is necessary as link.click() does not work on the latest firefox
//   link.dispatchEvent(
//     new MouseEvent('click', {
//       bubbles: true,
//       cancelable: true,
//       view: window,
//     }),
//   );

//   setTimeout(() => {
//     // For Firefox it is necessary to delay revoking the ObjectURL
//     URL.revokeObjectURL(blobURL);
//     link.remove();
//   }, 100);
// }
