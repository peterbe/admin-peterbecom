const numberFormat = new Intl.NumberFormat("en-US")
export function formatNumber(value: number) {
  return numberFormat.format(value)
}
