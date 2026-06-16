'use client'

import { useState } from 'react'
import { App, Button, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStore } from '@/store/useTaskStore'
import { download } from '@/lib/index'
import { sub2ass, sub2srt } from '@/lib/subtitle'
import { burnSubtitles } from '@/lib/ffmpeg'
import { useLoadFonts } from '@/hooks/useLoadFonts'

export function ExportDialog() {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const open = useAppStore(state => state.popup.export)
  const setPopup = useAppStore(state => state.setPopup)
  const { loadFonts } = useLoadFonts()

  const [burning, setBurning] = useState(false)
  const [burnProgress, setBurnProgress] = useState(0)

  function close() {
    if (burning) return
    setPopup('export', false)
  }

  function handleExportSrt() {
    const task = useTaskStore.getState().task
    if (!task.subtitle.length) {
      message.warning(t('export.subtitleEmpty'))
      return
    }
    const srt = sub2srt(task.subtitle, task.option.subtitleMode)
    const url = URL.createObjectURL(new Blob([srt], { type: 'text/plain' }))
    download(url, `${task.option.name || Date.now()}.srt`)
  }

  async function handleBurn() {
    if (burning) return

    const task = useTaskStore.getState().task
    const videoSource = task.offline.videoFile || task.offline.videoBlobUrl

    if (!task.subtitle.length) {
      message.warning(t('export.subtitleEmpty'))
      return
    }

    if (!videoSource) {
      message.error(t('create.videoNotPlay'))
      return
    }

    setBurning(true)
    setBurnProgress(0)

    try {
      const fonts = await loadFonts([task.style.Fontname])
      const assText = sub2ass(task)
      const duration = useTaskStore.getState().duration || task.offline.videoDuration

      const file = await burnSubtitles(
        {
          videoFile: videoSource,
          assText,
          fonts,
          burnPreset: task.option.burnPreset,
          burnSize: task.option.burnSize,
          duration,
        },
        ({ progress }) => {
          if (progress >= 0) setBurnProgress(progress)
        },
      )

      const url = URL.createObjectURL(file)
      download(url, `${task.option.name || Date.now()}.mp4`)
      message.success(t('export.success'))
    }
    catch (error) {
      message.error(error instanceof Error ? error.message : String(error))
    }
    finally {
      setBurning(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      closable={false}
      width="32rem"
      title={(
        <div className="relative flex items-center justify-center gap-2 text-base">
          <Icon name="fa-cloud-arrow-down" className="text-sm" />
          {t('header.export')}
          <Icon
            name="fa-xmark"
            className="absolute right-0 cursor-pointer text-xl text-white/50 transition duration-200 hover:text-white"
            onClick={close}
          />
        </div>
      )}
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-3 px-4">
          <div className="flex items-center gap-2 text-[13px] text-white/70">
            <Icon name="fa-subtitles" />
            {t('export.subtitle')}
          </div>
          <div className="flex items-center justify-between gap-3 rounded border border-dashed border-white/20 bg-white/5 px-3 py-3 text-[13px] text-white/60">
            <div>Download the subtitle track as a standalone .srt file</div>
            <Button size="small" disabled={burning} onClick={handleExportSrt}>
              <Icon name="fa-download" className="mr-1 text-xs" />
              .srt
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4">
          <div className="flex items-center gap-2 text-[13px] text-white/70">
            <Icon name="fa-video" />
            {t('export.video')}
          </div>
          <div className="flex flex-col gap-2 rounded border border-dashed border-white/20 bg-white/5 px-3 py-3 text-[13px] text-white/60">
            <div className="flex items-center justify-between gap-3">
              <div>Hardcode subtitles onto the video (ffmpeg.wasm) and export as .mp4</div>
              <Button size="small" loading={burning} disabled={burning} onClick={handleBurn}>
                <Icon name="fa-fire" className="mr-1 text-xs" />
                {burning ? `${Math.floor(burnProgress * 100)}%` : t('export.start')}
              </Button>
            </div>
            {burning && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[#502cab] transition-all duration-200"
                  style={{ width: `${Math.floor(burnProgress * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-black/50 bg-black/30 px-4 py-3">
        <Button size="large" disabled={burning} onClick={close}>
          <Icon name="fa-xmark" className="mr-2 text-xs" />
          {t('create.cancel')}
        </Button>
      </div>
    </Modal>
  )
}
