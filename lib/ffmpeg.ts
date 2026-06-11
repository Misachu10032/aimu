import localForage from 'localforage'
import { PATH } from '@/config/PATH'
import { downloadWithProgress } from '@/lib/index'

export interface FFmpegProgressInfo {
  progress: number
  message?: string
}

export type FFmpegProgressCallback = (info: FFmpegProgressInfo) => void

interface FFmpegLike {
  on: (event: 'log' | 'progress', cb: (data: { message?: string, progress?: number, time?: number }) => void) => void
  load: (config: { coreURL: string, wasmURL: string, workerURL: string }) => Promise<void>
  writeFile: (name: string, data: Uint8Array) => Promise<void>
  readFile: (name: string) => Promise<Uint8Array>
  deleteFile: (name: string) => Promise<void>
  exec: (args: string[]) => Promise<number>
}

declare global {
  interface Window {
    FFmpegWASM?: { FFmpeg: new () => FFmpegLike }
    FFmpegUtil?: {
      toBlobURL: (url: string, type: string) => Promise<string>
      fetchFile: (data: File | Blob | string) => Promise<Uint8Array>
    }
  }
}

const FFMPEG_CORE_WASM_SIZE = 32609891

let ffmpegInstance: FFmpegLike | null = null
let loadingPromise: Promise<FFmpegLike> | null = null
let activeLog: ((message: string) => void) | null = null
let activeProgress: ((progress: number, time?: number) => void) | null = null

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

async function getCachedCoreWasmUrl(onLog?: (message: string) => void): Promise<string> {
  const ffmpegStorage = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: 'aimu.app',
    storeName: 'ffmpeg',
  })

  const cached = await ffmpegStorage.getItem<Blob>('wasm')
  if (cached) {
    onLog?.('Loaded ffmpeg-core.wasm (cache)')
    return URL.createObjectURL(cached)
  }

  const blob = await downloadWithProgress({
    url: `${PATH.FFMPEG}/ffmpeg-core.wasm`,
    size: FFMPEG_CORE_WASM_SIZE,
    type: 'application/wasm',
    onProgress: ({ progress }) => onLog?.(`Loading ffmpeg-core.wasm ${Math.floor(progress * 100)}%`),
  })
  await ffmpegStorage.setItem('wasm', blob)
  onLog?.('Loaded ffmpeg-core.wasm')
  return URL.createObjectURL(blob)
}

async function getFFmpeg(onLog?: (message: string) => void): Promise<FFmpegLike> {
  if (ffmpegInstance) return ffmpegInstance
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    await injectScript(`${PATH.FFMPEG}/ffmpeg.js`)
    await injectScript(`${PATH.FFMPEG}/ffmpeg-util.js`)

    const { FFmpeg } = window.FFmpegWASM!
    const { toBlobURL } = window.FFmpegUtil!
    const ff = new FFmpeg()

    ff.on('log', ({ message }) => activeLog?.(message || ''))
    ff.on('progress', ({ progress, time }) => activeProgress?.(progress || 0, time))

    const wasmURL = await getCachedCoreWasmUrl(onLog)
    const coreURL = await toBlobURL(`${PATH.FFMPEG}/ffmpeg-core.js`, 'text/javascript')
    const workerURL = await toBlobURL(`${PATH.FFMPEG}/ffmpeg-core.worker.js`, 'text/javascript')

    await ff.load({ coreURL, wasmURL, workerURL })
    ffmpegInstance = ff
    return ff
  })()

  return loadingPromise
}

function makeProgressHandler(duration: number | undefined, onProgress?: FFmpegProgressCallback) {
  return (progress: number, time?: number) => {
    if (!onProgress) return
    if (progress > 0) {
      onProgress({ progress })
    }
    else if (time && duration) {
      onProgress({ progress: (time / 1_000_000) / duration })
    }
  }
}

async function runFFmpeg({
  args,
  output,
  mimeType,
  duration,
  onProgress,
}: {
  args: string[]
  output: string
  mimeType: string
  duration?: number
  onProgress?: FFmpegProgressCallback
}): Promise<Blob> {
  const ff = await getFFmpeg(message => onProgress?.({ progress: 0, message }))

  activeLog = message => onProgress?.({ progress: -1, message })
  activeProgress = makeProgressHandler(duration, onProgress)

  try {
    await ff.exec(args)
    const res = await ff.readFile(output)
    const blob = new Blob([new Uint8Array(res)], { type: mimeType })
    if (!blob || blob.size <= 1024) {
      throw new Error('FFmpeg produced an empty/invalid output file')
    }
    return blob
  }
  finally {
    activeLog = null
    activeProgress = null
    await ff.deleteFile(output).catch(() => null)
  }
}

async function writeInputFile(ff: FFmpegLike, file: File, name: string) {
  const { fetchFile } = window.FFmpegUtil!
  await ff.writeFile(name, await fetchFile(file))
}

function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { lastModified: Date.now() })
}

export async function extractAudio(
  videoFile: File,
  duration?: number,
  onProgress?: FFmpegProgressCallback,
): Promise<File> {
  const ff = await getFFmpeg(message => onProgress?.({ progress: 0, message }))
  await writeInputFile(ff, videoFile, videoFile.name)

  try {
    const output = `${Date.now()}.mp3`
    const blob = await runFFmpeg({
      output,
      mimeType: 'audio/mp3',
      duration,
      onProgress,
      args: [
        '-i', videoFile.name,
        '-vn',
        '-ar', '16000',
        '-ac', '1',
        '-c:a', 'libmp3lame',
        '-q:a', '4',
        output,
      ],
    })
    return blobToFile(blob, output)
  }
  finally {
    await ff.deleteFile(videoFile.name).catch(() => null)
  }
}

export async function burnSubtitles(
  {
    videoFile,
    assText,
    fonts,
    burnPreset,
    burnSize,
    duration,
  }: {
    videoFile: File
    assText: string
    fonts: { buffer: ArrayBuffer, path: string }[]
    burnPreset: string
    burnSize: number
  } & { duration?: number },
  onProgress?: FFmpegProgressCallback,
): Promise<File> {
  const ff = await getFFmpeg(message => onProgress?.({ progress: 0, message }))
  await writeInputFile(ff, videoFile, videoFile.name)

  const subtitleName = `${Date.now()}.ass`
  await ff.writeFile(subtitleName, new TextEncoder().encode(assText))

  for (const font of fonts) {
    await ff.writeFile(`/tmp/${font.path}`, new Uint8Array(font.buffer))
  }

  try {
    const output = `${Date.now()}-burned.mp4`
    const scale = burnSize ? `scale=-1:${burnSize},` : ''
    const blob = await runFFmpeg({
      output,
      mimeType: 'video/mp4',
      duration,
      onProgress,
      args: [
        '-i', videoFile.name,
        '-vf', `${scale}ass=${subtitleName}:fontsdir=/tmp`,
        '-max_muxing_queue_size', '1024',
        '-c:a', 'copy',
        '-preset', burnPreset,
        output,
      ],
    })
    return blobToFile(blob, output)
  }
  finally {
    await ff.deleteFile(videoFile.name).catch(() => null)
    await ff.deleteFile(subtitleName).catch(() => null)
    for (const font of fonts) {
      await ff.deleteFile(`/tmp/${font.path}`).catch(() => null)
    }
  }
}

export async function transcodeVideo(
  videoFile: File,
  duration?: number,
  onProgress?: FFmpegProgressCallback,
): Promise<File> {
  const ff = await getFFmpeg(message => onProgress?.({ progress: 0, message }))
  await writeInputFile(ff, videoFile, videoFile.name)

  try {
    const output = `${Date.now()}.mp4`
    const blob = await runFFmpeg({
      output,
      mimeType: 'video/mp4',
      duration,
      onProgress,
      args: [
        '-i', videoFile.name,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        output,
      ],
    })
    return blobToFile(blob, output)
  }
  finally {
    await ff.deleteFile(videoFile.name).catch(() => null)
  }
}

export async function remuxVideo(
  videoFile: File,
  audioFile: File,
  duration?: number,
  onProgress?: FFmpegProgressCallback,
): Promise<File> {
  const ff = await getFFmpeg(message => onProgress?.({ progress: 0, message }))
  await writeInputFile(ff, videoFile, videoFile.name)
  await writeInputFile(ff, audioFile, audioFile.name)

  try {
    const output = `${Date.now()}.mp4`
    const blob = await runFFmpeg({
      output,
      mimeType: 'video/mp4',
      duration,
      onProgress,
      args: [
        '-i', videoFile.name,
        '-i', audioFile.name,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-map', '0:v:0',
        '-map', '1:a:0',
        output,
      ],
    })
    return blobToFile(blob, output)
  }
  finally {
    await ff.deleteFile(videoFile.name).catch(() => null)
    await ff.deleteFile(audioFile.name).catch(() => null)
  }
}
