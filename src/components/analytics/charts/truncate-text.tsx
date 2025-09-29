import { Text, type TextProps } from "@mantine/core"

type Props = TextProps & {
  text: string
  maxLength?: number
}

export function TruncateText(props: Props) {
  const { text, maxLength = 100 } = props
  return <Text {...props}>{ellipsize(text, maxLength)}</Text>
}

function ellipsize(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}
