import { Text } from "@mantine/core";
import type { LocationT } from "./types";

function countryCodeToSVGPath(countryCode: string) {
  const norm = countryCode.toLowerCase();
  return `/flag-icons/4x3/${norm}.svg`;
}

export function DisplayLocation({ location }: { location: LocationT }) {
  if (!location.country_code) return null;

  return (
    <Text size="sm" fw={700}>
      <img
        src={countryCodeToSVGPath(location.country_code)}
        width={20}
        alt={location.country_code}
      />{" "}
      {location.city || <i>no city</i>},{" "}
      {location.country_name || <i>no country</i>}
    </Text>
  );
}