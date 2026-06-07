'use client'

import { useEffect, useRef } from 'react'
import Artplayer from 'artplayer'
import artplayerPluginDocumentPip from 'artplayer-plugin-document-pip'
import artplayerPluginJassub from 'artplayer-plugin-jassub'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useLoadFonts } from '@/hooks/useLoadFonts'
import { sub2ass } from '@/lib/subtitle'
import { PATH } from '@/config/PATH'
import { FONTS } from '@/config/FONTS'
import { sleep } from '@/lib/index'

Artplayer.LOG_VERSION = false

export function Player({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { loadFonts } = useLoadFonts()
  const toolbar = useAppStore(state => state.option.toolbar)
  const splitX = useAppStore(state => state.option.splitX)
  const videoUrl = useTaskStore(state => state.task.offline.videoBlobUrl)
  const task = useTaskStore(state => state.task)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const appStore = useAppStore.getState()

    function autoSize() {
      const art = useTaskStore.getState().art
      if (!art) return
      if (art.fullscreen) return
      if (art.fullscreenWeb) return
      art.autoSize()
    }

    function checkPortrait(art: Artplayer) {
      const portrait = art.video.videoWidth < art.video.videoHeight
      if (portrait && appStore.option.toolbar) {
        appStore.setOption('toolbar', false)
      }
    }

    async function loadJassub(art: Artplayer) {
      const fonts = await loadFonts()
      const buffers = fonts.map(font => new Uint8Array(font.buffer))
      const paths = FONTS.map(font => `${PATH.FONTS}/${font.path}`)
      art.plugins.add(
        artplayerPluginJassub({
          subContent: sub2ass(useTaskStore.getState().task),
          workerUrl: '/static/jassub/jassub-worker.js',
          wasmUrl: '/static/jassub/jassub-worker.wasm',
          modernWasmUrl: '/static/jassub/jassub-worker-modern.wasm',
          fonts: buffers.length > 0 ? buffers : paths,
        }),
      )
    }

    const art = new Artplayer({
      container,
      url: useTaskStore.getState().task.offline.videoBlobUrl,
      autoSize: true,
      loop: true,
      flip: true,
      hotkey: false,
      playbackRate: true,
      aspectRatio: true,
      setting: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      plugins: [
        artplayerPluginDocumentPip({
          width: 480,
          height: 270,
          fallbackToVideoPiP: true,
          placeholder: `Playing in Document Picture-in-Picture`,
        }),
      ],
    })

    art.on('ready', () => {
      checkPortrait(art)
      loadJassub(art)
    })

    art.on('restart', () => checkPortrait(art))
    art.on('blur', () => { art.controls.show = false })
    art.on('video:canplay', () => autoSize())

    useTaskStore.getState().setArt(art)

    let raf = 0
    const tick = () => {
      const state = useTaskStore.getState()
      state.setCurrentTime(art.currentTime || 0)
      state.setDuration(art.duration || 0)
      state.setArtSize({ height: art.height || 0, width: art.width || 0 })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      art.destroy()
      useTaskStore.getState().setArt(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const art = useTaskStore.getState().art
    if (art && art.url !== videoUrl) {
      art.url = videoUrl
    }
  }, [videoUrl])

  useEffect(() => {
    const art = useTaskStore.getState().art
    if (!art) return
    if (art.fullscreen || art.fullscreenWeb) return
    art.autoSize()
  }, [splitX])

  useEffect(() => {
    (async () => {
      await sleep(300)
      const art = useTaskStore.getState().art
      if (!art) return
      if (art.fullscreen || art.fullscreenWeb) return
      art.autoSize()
    })()
  }, [toolbar])

  useEffect(() => {
    (async () => {
      const art = Artplayer.instances[0]
      if (!art) return
      const instance = (art.plugins as unknown as { artplayerPluginJassub?: { instance: any } }).artplayerPluginJassub?.instance
      if (!instance) return
      await instance.ready
      const newAssText = sub2ass(task)
      await instance.setTrack(newAssText)
      instance._demandRender({
        mediaTime: art.currentTime,
        width: art.video.videoWidth,
        height: art.video.videoHeight,
      })
    })()
  }, [task])

  return (
    <div className={`relative p-4 ${className}`}>
      <div ref={containerRef} className="flex h-full w-full items-center justify-center" />
    </div>
  )
}
