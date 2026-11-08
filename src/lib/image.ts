// Lesson images are resized and re-encoded in the browser before upload
// (TASK-029): phone photos are often 4000 px / 3–5 MB, the app shows them
// about 1000 px wide.

export const IMAGE_MAX_EDGE = 1600
export const IMAGE_QUALITY = 0.8

/** Size that fits in `maxEdge` × `maxEdge`, keeping the ratio; never upscales. */
export function fitSize(width: number, height: number, maxEdge = IMAGE_MAX_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || 'image'

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

export interface CompressedImage {
  file: File
  /** Size of the original picture. */
  width: number
  height: number
}

/**
 * Resized to IMAGE_MAX_EDGE and encoded as WebP (JPEG where the browser
 * cannot encode WebP). Keeps the original when that would be smaller.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap
  try {
    const size = fitSize(width, height)
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return { file, width, height }
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, size.width, size.height)

    let blob = await toBlob(canvas, 'image/webp', IMAGE_QUALITY)
    if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', IMAGE_QUALITY)
    if (!blob || (blob.size >= file.size && size.width === width)) return { file, width, height }

    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
    return { file: new File([blob], `${baseName(file.name)}.${ext}`, { type: blob.type }), width, height }
  } finally {
    bitmap.close()
  }
}
