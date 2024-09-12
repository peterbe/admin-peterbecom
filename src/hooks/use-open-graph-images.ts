import { useQuery } from "@tanstack/react-query";

export type OpenGraphImageT = {
  label: string;
  src: string;
  size: [number, number];
  current: null | boolean;
  used_in_text: boolean;
};

type OpenGraphImages = {
  images: OpenGraphImageT[];
};

export function useOpenGraphImages(oid: string) {
  return useQuery<OpenGraphImages>({
    queryKey: ["open-graph-image", oid],
    queryFn: async () => {
      const response = await fetch(`/api/v0/plog/${oid}/open-graph-image`);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return response.json();
    },
  });
}
