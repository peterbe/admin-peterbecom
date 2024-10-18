export function thousands(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
