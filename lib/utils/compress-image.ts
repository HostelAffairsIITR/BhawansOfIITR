import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  // Skip compression for non-image files (e.g. PDFs in notice attachments)
  if (!file.type.startsWith('image/')) return file

  const options = {
    maxSizeMB: 1,           // max 1MB output
    maxWidthOrHeight: 1920, // max dimension 1920px
    useWebWorker: true,     // non-blocking
    fileType: 'image/webp', // convert to webp for better compression
  }

  try {
    const compressed = await imageCompression(file, options)
    // Make sure we return a File object, preserves the original filename but change extension to .webp
    const originalName = file.name
    const webpName = originalName.substring(0, originalName.lastIndexOf('.')) + '.webp'
    return new File([compressed], webpName, { type: 'image/webp' })
  } catch {
    // If compression fails, upload original
    return file
  }
}
