import localForage from 'localforage'
import { FONTS } from '@/config/FONTS'
import { PATH } from '@/config/PATH'
import type { FontConfig } from '@/config/FONTS'

async function setFontFace(family: string, source: ArrayBuffer | string): Promise<ArrayBuffer> {
  if (typeof source === 'string') {
    const fetchArrayBuffer = await (await fetch(source)).arrayBuffer()
    const font = new FontFace(family, fetchArrayBuffer)
    await font.load()
    document.fonts.add(font)
    return fetchArrayBuffer
  }
  const font = new FontFace(family, source)
  await font.load()
  document.fonts.add(font)
  return source
}

async function loadOne(font: FontConfig): Promise<ArrayBuffer> {
  const fontsStorage = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: 'aimu.app',
    storeName: 'fonts',
  })

  const path = `${PATH.FONTS}/${font.path}`
  const blob = await fontsStorage.getItem<Blob>(font.name)

  if (blob && typeof (blob as Blob).arrayBuffer === 'function') {
    const arrayBuffer = await blob.arrayBuffer()
    await setFontFace(font.name, arrayBuffer)
    return arrayBuffer
  }

  const arrayBuffer = await setFontFace(font.name, path)
  await fontsStorage.setItem(font.name, new Blob([arrayBuffer]))
  return arrayBuffer
}

export function useLoadFonts() {
  async function loadFonts(fontnames: string[] = []): Promise<Array<FontConfig & { buffer: ArrayBuffer }>> {
    if (typeof window === 'undefined') return []
    if (!window.FontFace || !window.indexedDB) return []

    const list = fontnames.length
      ? fontnames.map(name => FONTS.find(item => item.name === name)).filter((f): f is FontConfig => Boolean(f))
      : FONTS

    const result: Array<FontConfig & { buffer: ArrayBuffer }> = []
    for (const font of list) {
      try {
        const buffer = await loadOne(font)
        result.push({ buffer, ...font })
      }
      catch (error) {
        console.warn('Loading Font Error', error)
      }
    }
    return result
  }

  return { loadFonts }
}
