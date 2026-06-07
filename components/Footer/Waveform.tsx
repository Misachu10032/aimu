'use client'

import { useEffect, useRef, useState } from 'react'
import WFPlayer from 'wfplayer'
import { useTranslation } from 'react-i18next'
import { message } from 'antd'
import { useTaskStore } from '@/store/useTaskStore'
import { OPTION } from '@/config/OPTION'
import { sleep } from '@/lib/index'

export function FooterWaveform() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const videoBlobUrl = useTaskStore(state => state.task.offline.videoBlobUrl)
  const audioBlobUrl = useTaskStore(state => state.task.offline.audioBlobUrl)
  const videoFile = useTaskStore(state => state.task.offline.videoFile)
  const audioFile = useTaskStore(state => state.task.offline.audioFile)

  useEffect(() => {
    const container = containerRef.current
    const art = useTaskStore.getState().art
    if (!container || !art) return

    useTaskStore.getState().setBeginTime(0)
    useTaskStore.getState().wf?.destroy()

    const wf = new WFPlayer({
      container,
      mediaElement: art.video,
      scrollable: true,
      useWorker: true,
      duration: 20,
      padding: 5,
      waveScale: 0.8,
      waveSize: 2,
      scrollbar: false,
      pixelRatio: 2,
      backgroundColor: '#0e0e0e',
      waveColor: 'rgba(255, 255, 255, 0.2)',
      progressColor: 'rgba(255, 255, 255, 0.6)',
      gridColor: 'rgba(255, 255, 255, 0.02)',
      rulerColor: 'rgba(255, 255, 255, 0.5)',
    })

    useTaskStore.getState().setWf(wf)

    wf.on('decode:success', () => setLoading(false))
    wf.on('decode:error', () => {
      setLoading(false)
      wf.reset()
      message.error(t('task.audioDecodeError'))
    })
    wf.on('update', (config) => {
      useTaskStore.getState().setBeginTime(config.beginTime)
    })
    art.on('restart', () => wf.update())

    async function decodeVideoFile(file: File | string) {
      if (typeof file === 'string') {
        setLoading(true)
        const res = await fetch(file)
        const arrayBuffer = await res.arrayBuffer()
        wf.load(new Uint8Array(arrayBuffer))
        return
      }
      if (file.size <= OPTION.MAX_AUDIO_DECODE) {
        setLoading(true)
        const reader = new FileReader()
        reader.onload = (event) => {
          wf.reset()
          const arrayBuffer = event.target?.result as ArrayBuffer
          wf.load(new Uint8Array(arrayBuffer))
        }
        reader.readAsArrayBuffer(file)
      }
      else {
        wf.reset()
        message.error(t('task.audioDecodeError'))
      }
    }

    async function checkAudio() {
      const { audioFile, audioBlobUrl, videoFile, videoBlobUrl } = useTaskStore.getState().task.offline
      await decodeVideoFile(audioFile || audioBlobUrl || videoFile || videoBlobUrl)
    }

    ;(async () => {
      await checkAudio()
      await sleep(1000)
      wf.update()
    })()

    return () => {
      wf.destroy()
      useTaskStore.getState().setWf(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoBlobUrl, audioBlobUrl, videoFile, audioFile])

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className={`h-full w-full transition duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  )
}
