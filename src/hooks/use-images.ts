import { useQuery } from "@tanstack/react-query"

export type ImageT = {
  id: number
  full_url: string
  full_size: number[]
  small: {
    url: string
    alt: null | string
    width: number
    height: number
  }
  big: {
    url: string
    alt: null | string
    width: number
    height: number
  }
  bigger: {
    url: string
    alt: null | string
    width: number
    height: number
  }
}
type ServerImages = {
  images: ImageT[]
}

export function useImages(oid: string) {
  return useQuery<ServerImages>({
    queryKey: ["images", oid],
    queryFn: async () => {
      const response = await fetch(`/api/v0/plog/${oid}/images`)
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
  })
}
