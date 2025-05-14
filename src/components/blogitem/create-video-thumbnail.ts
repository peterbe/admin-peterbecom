/**
 * Creates a data URI thumbnail from an uploaded video file
 * @param videoFile - The video file to generate a thumbnail from
 * @param options - Optional settings for thumbnail generation
 * @returns Promise resolving to a data URI string representing the thumbnail
 */
export function createVideoThumbnail(
  videoFile: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    captureTime?: number
    format?: "image/jpeg" | "image/png" | "image/webp"
  } = {},
): Promise<string> {
  const {
    maxWidth = 900,
    maxHeight = 507,
    quality = 0.85,
    captureTime = 0.1,
    format = "image/jpeg",
  } = options

  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Failed to get canvas context"))
      return
    }

    video.preload = "metadata"
    video.muted = true
    video.playsInline = true

    const videoUrl = URL.createObjectURL(videoFile)
    video.src = videoUrl

    video.onloadedmetadata = () => {
      let width = video.videoWidth
      let height = video.videoHeight

      if (width > maxWidth) {
        height = Math.floor(height * (maxWidth / width))
        width = maxWidth
      }

      if (height > maxHeight) {
        width = Math.floor(width * (maxHeight / height))
        height = maxHeight
      }
      canvas.width = width
      canvas.height = height

      video.currentTime = captureTime
    }

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataURI = canvas.toDataURL(format, quality)
      URL.revokeObjectURL(videoUrl)
      resolve(dataURI)
    }

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl)
      reject(new Error("Error loading video file"))
    }

    video.load()
  })
}
