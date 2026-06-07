import DT from 'duration-time-conversion'
import { filesize } from 'filesize'
import { OPTION } from '@/config/OPTION'

export function t2d(time: string): number {
  return DT.t2d(time)
}

export function d2t(duration: number, trim?: boolean): string {
  if (trim) {
    return DT.d2t(duration).split('.')[0]
  }
  return DT.d2t(duration)
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getSize(size: number): string {
  if (!size) return 'N/A'
  return filesize(size, { base: 10, standard: 'jedec' }) as string
}

export function sleep(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function download(url: string, name: string) {
  const elink = document.createElement('a')
  elink.style.display = 'none'
  elink.href = url
  elink.download = name
  document.body.appendChild(elink)
  elink.click()
  document.body.removeChild(elink)
}

export function getKeyCode(event: KeyboardEvent): string | undefined {
  const tag = document.activeElement?.tagName.toUpperCase()
  const editable = document.activeElement?.getAttribute('contenteditable')
  if (
    tag !== 'INPUT'
    && tag !== 'TEXTAREA'
    && editable !== ''
    && editable !== 'true'
  ) {
    return event.code
  }
}

export function runPromisesInSeries<T>(ps: Array<() => Promise<T>>): Promise<T | undefined> {
  return ps.reduce<Promise<T | undefined>>((p, next) => p.then(() => next()), Promise.resolve(undefined))
}

export function fileToBlobUrl(file: File | Blob): string {
  return URL.createObjectURL(new Blob([file]))
}

export function getFileFormat(name: string): string {
  return name.trim().toLowerCase().split('.').pop() || ''
}

export function checkSubFormat(file: File): boolean {
  const format = getFileFormat(file.name)
  return OPTION.SUBTITLE.includes(format)
}

export function checkVideoFormat(file: File): boolean {
  const format = getFileFormat(file.name)
  return OPTION.VIDEO.includes(format)
}

export function blobToFile(theBlob: Blob, fileName: string): File {
  return new File([theBlob], fileName, { lastModified: Date.now() })
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = function () {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.readAsDataURL(blob)
  })
}

export function base64toBlob(base64Data: string, contentType = ''): Blob {
  const sliceSize = 1024
  const byteCharacters = atob(base64Data)
  const bytesLength = byteCharacters.length
  const slicesCount = Math.ceil(bytesLength / sliceSize)
  const byteArrays: BlobPart[] = new Array(slicesCount)

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize
    const end = Math.min(begin + sliceSize, bytesLength)

    const bytes: number[] = new Array(end - begin)
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }
  return new Blob(byteArrays, { type: contentType })
}

export async function downloadWithProgress({
  url,
  size = 0,
  type = '',
  onProgress,
}: {
  url: string
  size?: number
  type?: string
  onProgress: (info: { size: number, progress: number }) => void
}): Promise<Blob> {
  const response = await fetch(url)
  const contentLength = size || response.headers.get('content-length')
  const total = contentLength ? Number.parseInt(String(contentLength), 10) : null

  const reader = response.body!.getReader()
  let receivedLength = 0
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    receivedLength += value.length
    onProgress({ size: receivedLength, progress: total ? receivedLength / total : Infinity })
  }

  const chunksAll = new Uint8Array(receivedLength)
  let position = 0
  for (const chunk of chunks) {
    chunksAll.set(chunk, position)
    position += chunk.length
  }

  return new Blob([chunksAll], { type })
}

export async function createBase64FromFile(file: File | Blob) {
  if (file instanceof File || file instanceof Blob) {
    return {
      type: file.type,
      ext: 'name' in file ? getFileFormat((file as File).name) : '',
      base64: await blobToBase64(new Blob([file])),
    }
  }
  return null
}

export function createFileFromBase64({ base64, type, ext }: { base64: string, type: string, ext: string }): File {
  return new File([base64toBlob(base64, type)], `${Date.now()}.${ext}`)
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

export function checkIsolated(): boolean {
  if (typeof window !== 'undefined') {
    return window.crossOriginIsolated && window.isSecureContext
  }
  return false
}
