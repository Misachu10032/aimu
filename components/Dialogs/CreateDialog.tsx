'use client'

import { useRef } from 'react'
import { Button, message, Modal, Input as AntInput } from 'antd'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useCreateStore } from '@/store/useCreateStore'
import { checkVideoFormat, d2t, getSize } from '@/lib/index'

export function CreateDialog() {
  const { t } = useTranslation()
  const open = useAppStore(state => state.popup.create)
  const setPopup = useAppStore(state => state.setPopup)

  const name = useCreateStore(state => state.task.option.name)
  const setName = useCreateStore(state => state.setName)
  const uploaded = useCreateStore(state => state.uploaded)
  const analyzing = useCreateStore(state => state.analyzing)
  const analysisProgress = useCreateStore(state => state.analysisProgress)
  const videoType = useCreateStore(state => state.task.option.videoType)
  const offline = useCreateStore(state => state.task.offline)
  const reset = useCreateStore(state => state.reset)
  const onFileChange = useCreateStore(state => state.onFileChange)

  const fileInputRef = useRef<HTMLInputElement>(null)

  function close() {
    setPopup('create', false)
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const file = files[0]
    if (!checkVideoFormat(file)) {
      message.error(t('create.formatErr'))
      return
    }
    try {
      const ok = await onFileChange(file)
      if (!ok) message.error(t('create.videoNotPlay'))
    }
    catch (error) {
      console.error(error)
      message.error(t('create.videoNotPlay'))
    }
  }

  async function onSubmit() {
    if (!uploaded) {
      message.error(t('create.selectVideo'))
      return
    }

    const task = useCreateStore.getState().task
    if (task.offline.canPlay === false) {
      message.error(t('create.videoNotPlay'))
      return
    }

    task.subtitle = []
    useTaskStore.getState().create(task)
    close()
    reset()
    message.success(t('create.createSuccess'))
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      closable={false}
      width="36rem"
      title={(
        <div className="relative flex items-center justify-center gap-2 text-base">
          <Icon name="fa-rocket-launch" className="text-sm" />
          {t('create.header')}
          <Icon
            name="fa-xmark"
            className="absolute right-0 cursor-pointer text-xl text-white/50 transition duration-200 hover:text-white"
            onClick={close}
          />
        </div>
      )}
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-4 text-[13px] text-white/70">
            <Icon name="fa-text" />
            {t('create.name')}
          </div>
          <div className="px-4">
            <AntInput
              size="large"
              maxLength={100}
              value={name}
              placeholder={t('create.namePlaceholder') as string}
              onChange={e => setName(e.target.value.trim())}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-4 text-[13px] text-white/70">
            <Icon name="fa-video" />
            {t('create.video')}
          </div>
          <div className="h-24 px-4">
            {uploaded
              ? (
                  <div className="flex h-full justify-between gap-2">
                    <div className="h-24 w-24 shrink-0 rounded border border-dashed border-white/20 bg-white/10 p-0.5">
                      {offline.videoPoster
                        ? <img src={offline.videoPoster} alt="" className="h-full w-full rounded object-cover" />
                        : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded bg-black/50 text-xs text-white/40">
                              <Icon name="fa-image" className="text-4xl" />
                              {t('create.posterNo')}
                            </div>
                          )}
                    </div>
                    <div className="flex w-0 flex-1 flex-col justify-between">
                      <div className="flex flex-col gap-1.5 rounded bg-black/20 p-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="text-white/50">{t('create.file')}</div>
                          <div className="w-0 flex-1 truncate text-white/80">{offline.videoFile?.name}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-white/50">{t('create.duration')}</div>
                            <div className="font-semibold text-red-700">
                              {d2t(offline.videoDuration === Infinity ? 0 : offline.videoDuration, true)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-white/50">{t('create.size')}</div>
                            <div className="text-white/80">{getSize(offline.videoFile?.size || 0)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-white/50">{t('create.type')}</div>
                            <div className="text-white/80">{t(`type.video.${videoType}`)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button size="small" onClick={() => reset()}>
                          <Icon name="fa-retweet" className="mr-1 text-sm" />
                          {t('create.reselect')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              : (
                  <div
                    className="relative flex h-full cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-white/20 bg-white/5 text-sm text-white/70 transition duration-300 hover:bg-white/10 hover:text-white"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,audio/*"
                      className="hidden"
                      onChange={e => handleFiles(e.target.files)}
                    />
                    <Icon name="fa-cloud-arrow-up" className="text-3xl" />
                    <div className="text-[13px]">
                      {analyzing ? `${t('create.analyzing')} ${(analysisProgress * 100).toFixed(2)}%` : t('type.video.1')}
                    </div>
                  </div>
                )}
          </div>
        </div>
      </div>

      <div className="flex justify-between border-t border-black/50 bg-black/30 px-4 py-3">
        <div className="flex items-center gap-1">
          <Button size="large" onClick={close}>
            <Icon name="fa-xmark" className="mr-2 text-xs" />
            {t('create.cancel')}
          </Button>
          <Button size="large" onClick={() => reset()}>
            <Icon name="fa-broom-wide" className="mr-2 text-xs" />
            {t('create.reset')}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button type="primary" size="large" disabled={analyzing} onClick={onSubmit}>
            <Icon name="fa-rocket-launch" className="mr-2 text-sm" />
            {t('create.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
