export function hasDiffValue(list: any[], key: string, value: any) {
  if (value === undefined) value = list[0][key];
  return list.some((item) => item[key] !== value);
}

export function hasSameValue(list: any[], key: string, value: any) {
  if (value === undefined) value = list[0][key];
  return list.every((item) => item[key] === value);
}
