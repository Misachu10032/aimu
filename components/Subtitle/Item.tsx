'use client'

import { Input, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStore, useCurrentIndex } from '@/store/useTaskStore'
import { OPTION } from '@/config/OPTION'
import { isErrorSub } from '@/lib/task'
import { Sub } from '@/lib/Sub'
import type { Sub as SubType } from '@/lib/Sub'

export function SubtitleItem({ item, index, height }: { item: SubType, index: number, height: number }) {
  const { t } = useTranslation()
  const tooltip = useAppStore(state => state.option.tooltip)
  const subtitleMode = useTaskStore(state => state.task.option.subtitleMode)
  const subtitle = useTaskStore(state => state.task.subtitle)
  const updateSubtitleField = useTaskStore(state => state.updateSubtitleField)
  const removeSubtitle = useTaskStore(state => state.removeSubtitle)
  const mergeSubtitle = useTaskStore(state => state.mergeSubtitle)
  const insertSubtitleAfter = useTaskStore(state => state.insertSubtitleAfter)
  const currentIndex = useCurrentIndex()

  const current = currentIndex === index
  const message = isErrorSub(subtitle, item, t)

  function onItemClick() {
    const art = useTaskStore.getState().art
    if (art) art.seek = item.startTime + 0.05
  }

  function onAddClick() {
    insertSubtitleAfter(index, new Sub({ startTime: item.endTime, endTime: item.endTime + 1, text: t('task.tmp') }))
  }

  return (
    <div
      className={`relative transition ${current && !message ? '!bg-[#562ab2]' : !(index % 2) && !message ? 'bg-white/5' : ''} ${message ? 'bg-red-700/50' : ''}`}
      style={{ height }}
    >
      <div className="flex h-full items-center" onClick={onItemClick}>
        <div className="flex h-full w-7 flex-col items-center justify-between border-r border-[#1d1e23] py-3 text-base text-white/40">
          <Tooltip title={tooltip ? t('task.remove') : undefined} placement="left">
            <div
              className="flex w-full cursor-pointer justify-center transition hover:text-white active:scale-90"
              onClick={(e) => { e.stopPropagation(); removeSubtitle(index) }}
            >
              <Icon name="fa-trash-can" className="text-xs" />
            </div>
          </Tooltip>
          <Tooltip title={tooltip ? t('task.merge') : undefined} placement="left">
            <div
              className="flex w-full cursor-pointer justify-center transition hover:text-white active:scale-90"
              onClick={(e) => { e.stopPropagation(); mergeSubtitle(index) }}
            >
              <Icon name="fa-merge" className="text-xs" />
            </div>
          </Tooltip>
          <Tooltip title={tooltip ? t('task.insert') : undefined} placement="left">
            <div
              className="flex w-full cursor-pointer justify-center transition hover:text-white active:scale-90"
              onClick={(e) => { e.stopPropagation(); onAddClick() }}
            >
              <Icon name="fa-plus" className="text-xs" />
            </div>
          </Tooltip>
        </div>
        <div className="flex h-full w-[7.7rem] flex-col items-start justify-between border-r border-[#1d1e23] p-2 text-[13px] text-white/70">
          <div className="flex w-full items-center gap-1">
            <div className="flex w-3 justify-center text-xs">
              <Icon name="fa-arrow-up-to-line" className="scale-90 text-xs" />
            </div>
            <div className="flex-1 truncate">{item.start}</div>
          </div>
          <div className="flex w-full items-center gap-1">
            <div className="flex w-3 justify-center text-xs">
              <Icon name="fa-arrow-down-to-line" className="scale-90 text-xs" />
            </div>
            <div className="flex-1 truncate">{item.end}</div>
          </div>
          <div className="flex w-full items-center gap-1">
            <div className="flex w-3 justify-center text-xs">
              <Icon name="fa-timer" className="scale-[0.8] text-xs" />
            </div>
            <div className="flex-1 truncate">{item.duration || 0}</div>
          </div>
          <div className="flex w-full items-center gap-1">
            <div className="flex w-3 justify-center text-xs">
              <Icon name="fa-hashtag" className="scale-90 text-xs" />
            </div>
            <div className="flex-1 truncate">{index}</div>
          </div>
        </div>
        <div className={`relative flex h-full flex-1 flex-col subtitle-mode-${subtitleMode}`} onClick={e => e.stopPropagation()}>
          {(subtitleMode === 1 || subtitleMode === 2) && (
            <Input.TextArea
              value={item.text}
              rows={2}
              className="!h-full flex-1 resize-none !rounded-none !border-white/10 !bg-black/70"
              maxLength={OPTION.MAX_SUB_WORD}
              placeholder={t('task.textPlaceholder') as string}
              onChange={e => updateSubtitleField(index, 'text', e.target.value)}
              onFocus={() => useTaskStore.getState().art?.pause()}
            />
          )}
          {(subtitleMode === 1 || subtitleMode === 3) && (
            <Input.TextArea
              value={item.text2}
              rows={2}
              className="!h-full flex-1 resize-none !rounded-none !border-white/10 !bg-black/70"
              maxLength={OPTION.MAX_SUB_WORD}
              placeholder={t('task.text2Placeholder') as string}
              onChange={e => updateSubtitleField(index, 'text2', e.target.value)}
              onFocus={() => useTaskStore.getState().art?.pause()}
            />
          )}
          {subtitleMode === 1 && (
            <div className={`absolute top-1/2 z-10 h-[1px] w-full ${current ? 'bg-[#562ab2]' : 'bg-[#1d1e23]'}`} />
          )}
        </div>
      </div>
      {index !== 0 && <div className="absolute top-0 h-[1px] w-full bg-[#1d1e23]" />}
    </div>
  )
}
