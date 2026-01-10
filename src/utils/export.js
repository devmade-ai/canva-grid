import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { platforms } from '../config/platforms'

export async function exportSinglePlatform(canvasRef, platformId, state) {
  const platform = platforms.find((p) => p.id === platformId)
  if (!canvasRef.current || !platform) return

  try {
    const dataUrl = await toPng(canvasRef.current, {
      width: platform.width,
      height: platform.height,
      pixelRatio: 1,
    })

    const link = document.createElement('a')
    link.download = `ad-${platform.id}-${platform.width}x${platform.height}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}

export async function exportAllPlatforms(canvasRef, state, onProgress) {
  const zip = new JSZip()
  const originalPlatform = state.platform

  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i]
    onProgress?.({ current: i + 1, total: platforms.length, platform: platform.name })

    try {
      // We need to render at each platform size
      // This is handled by temporarily switching the platform in the parent component
      const dataUrl = await toPng(canvasRef.current, {
        width: platform.width,
        height: platform.height,
        pixelRatio: 1,
      })

      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      zip.file(`ad-${platform.id}-${platform.width}x${platform.height}.png`, blob)
    } catch (error) {
      console.error(`Export failed for ${platform.name}:`, error)
    }
  }

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, 'social-ads.zip')

  return originalPlatform
}

export async function captureForPlatform(element, platform) {
  try {
    const dataUrl = await toPng(element, {
      width: platform.width,
      height: platform.height,
      pixelRatio: 1,
    })
    return dataUrl
  } catch (error) {
    console.error(`Capture failed for ${platform.name}:`, error)
    throw error
  }
}
