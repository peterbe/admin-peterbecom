import { useQuery } from "@tanstack/react-query"
import { openGraphImagesQueryKey } from "../components/api-utils"

export type OpenGraphImageT = {
  id: number
  label: string
  src: string
  size: [number, number]
  is_open_graph_image: null | boolean
  used_in_text: boolean
}

type OpenGraphImages = {
  images: OpenGraphImageT[]
}

export function useOpenGraphImages(oid: string) {
  return useQuery<OpenGraphImages>({
    queryKey: openGraphImagesQueryKey(oid),
    queryFn: async () => {
      const response = await fetch(`/api/v0/plog/${oid}/open-graph-image`)
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
  })
}
