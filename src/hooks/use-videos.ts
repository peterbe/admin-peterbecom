import { useQuery } from "@tanstack/react-query"
import { videosQueryKey } from "../components/api-utils"

type VideoThumbnailSize = "full" | "big" | "bigger"
type VideoFormat = "mov" | "mp4" | "webm"

export type VideoThumbnail = {
  url: string
  alt: string
  width: number
  height: number
}
export type VideoT = {
  id: number
  thumbnails: Record<VideoThumbnailSize, VideoThumbnail>
  formats: Record<
    VideoFormat,
    {
      url: string
      type: string
    }
  >
}
type ServerVideos = {
  videos: VideoT[]
}

export function useVideos(oid: string) {
  return useQuery<ServerVideos>({
    queryKey: videosQueryKey(oid),
    queryFn: async () => {
      const response = await fetch(`/api/v0/plog/${oid}/videos`)
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`)
      }
      return response.json()
    },
  })
}
