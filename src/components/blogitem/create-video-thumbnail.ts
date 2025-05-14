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
  // Set default options
  const {
    maxWidth = 320,
    maxHeight = 180,
    quality = 0.8,
    captureTime = 1.0,
    format = "image/jpeg",
  } = options

  return new Promise((resolve, reject) => {
    // Create HTML elements needed for processing
    const video = document.createElement("video")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Failed to get canvas context"))
      return
    }

    // Set up video element
    video.preload = "metadata"
    video.muted = true
    video.playsInline = true

    // Create object URL for the video file
    const videoUrl = URL.createObjectURL(videoFile)
    video.src = videoUrl

    // Handle video load and prepare for thumbnail capture
    video.onloadedmetadata = () => {
      // Calculate dimensions while maintaining aspect ratio
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

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Seek to the specified time
      video.currentTime = captureTime
    }

    // Capture frame once the video is seeked to the right position
    video.onseeked = () => {
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to data URI
      const dataURI = canvas.toDataURL(format, quality)

      // Clean up resources
      URL.revokeObjectURL(videoUrl)

      resolve(dataURI)
    }

    // Handle errors
    video.onerror = () => {
      URL.revokeObjectURL(videoUrl)
      reject(new Error("Error loading video file"))
    }

    // Start video loading
    video.load()
  })
}
