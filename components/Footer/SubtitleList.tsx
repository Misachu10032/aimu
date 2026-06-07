'use client'

import { Popover } from 'antd'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useTaskStore, useCurrentSubtitles } from '@/store/useTaskStore'
import { Sub } from '@/lib/Sub'
import type { Sub as SubType } from '@/lib/Sub'
import { FooterItem } from './Item'

export function FooterSubtitleList() {
  const { t } = useTranslation()
  const beginTime = useTaskStore(state => state.beginTime)
  const subtitles = useCurrentSubtitles()

  function findIndex(item: SubType) {
    return useTaskStore.getState().task.subtitle.findIndex(i => i._id === item._id)
  }

  function onRemoveClick(item: SubType) {
    const index = findIndex(item)
    if (index > -1) useTaskStore.getState().removeSubtitle(index)
  }

  function onMergeClick(item: SubType) {
    const index = findIndex(item)
    if (index > -1) useTaskStore.getState().mergeSubtitle(index)
  }

  function onAddClick(item: SubType) {
    const index = findIndex(item)
    if (index > -1) {
      useTaskStore.getState().insertSubtitleAfter(index, new Sub({
        startTime: item.endTime,
        endTime: item.endTime + 1,
        text: t('task.tmp'),
      }))
    }
  }

  return (
    <div className={`pointer-events-none absolute left-0 right-0 top-12 z-30 h-20 w-full transition duration-300 ${beginTime ? 'opacity-100' : 'opacity-0'}`}>
      {subtitles.map(item => (
        <Popover
          key={item._id}
          trigger="contextMenu"
          content={(
            <div className="flex flex-col gap-1 text-[13px]">
              <div className="flex cursor-pointer items-center gap-1 rounded py-1 pl-2 pr-3 hover:bg-white/5" onClick={() => onRemoveClick(item)}>
                <div className="flex w-4 justify-center text-xs"><Icon name="fa-trash-can" /></div>
                {t('task.remove')}
              </div>
              <div className="flex cursor-pointer items-center gap-1 rounded py-1 pl-2 pr-3 hover:bg-white/5" onClick={() => onMergeClick(item)}>
                <div className="flex w-4 justify-center text-xs"><Icon name="fa-merge" /></div>
                {t('task.merge')}
              </div>
              <div className="flex cursor-pointer items-center gap-1 rounded py-1 pl-2 pr-3 hover:bg-white/5" onClick={() => onAddClick(item)}>
                <div className="flex w-4 justify-center text-xs"><Icon name="fa-plus" /></div>
                {t('task.insert')}
              </div>
            </div>
          )}
        >
          <FooterItem item={item} />
        </Popover>
      ))}
    </div>
  )
}
