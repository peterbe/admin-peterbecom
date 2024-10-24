import { Box, Group, SegmentedControl, Text } from "@mantine/core";

const CHOICES = [5, 10, 15, 25, 50, 100].map((n) => ({
  label: n.toString(),
  value: n.toString(),
}));

export function PaginationSize({
  value,
  setValue,
  disabled,
}: {
  value: string;
  setValue: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <Box mt={30}>
      <Group>
        <Text size="sm">Pagination size</Text>
        <SegmentedControl
          disabled={disabled}
          withItemsBorders={false}
          size="xs"
          radius="xs"
          value={value}
          onChange={setValue}
          data={CHOICES}
        />
      </Group>
    </Box>
  );
}
