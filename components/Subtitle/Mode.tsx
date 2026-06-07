'use client'

import { useTranslation } from 'react-i18next'
import { Tooltip } from 'antd'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStore } from '@/store/useTaskStore'

export function SubtitleMode() {
  const { t } = useTranslation()
  const tooltip = useAppStore(state => state.option.tooltip)
  const mode = useTaskStore(state => state.task.option.subtitleMode)
  const setTaskOption = useTaskStore(state => state.setTaskOption)
  const subtitle = useTaskStore(state => state.task.subtitle)
  const replaceSubtitles = useTaskStore(state => state.replaceSubtitles)

  function onSwapClick() {
    const swapped = subtitle.map((item) => {
      const clone = item.clone
      clone.text = item.text2
      clone.text2 = item.text
      return clone
    })
    replaceSubtitles(swapped)
  }

  return (
    <div className="flex h-full shrink-0 items-center gap-2 px-3 text-[13px]">
      <div className="flex items-center gap-1 text-white/60">
        {t('mode.name')}
        :
      </div>
      <div className="relative flex h-7 items-center overflow-hidden rounded bg-white/10 text-white/70">
        {[1, 2, 3].map(value => (
          <div
            key={value}
            className={`relative z-10 cursor-pointer px-2 py-1 hover:text-white ${mode === value ? 'text-white' : ''}`}
            onClick={() => setTaskOption('subtitleMode', value)}
          >
            {t(`mode.${value}`)}
          </div>
        ))}
      </div>
      <Tooltip title={tooltip ? t('utils.swap') : undefined}>
        <div
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-white/10 text-white/70 hover:text-white"
          onClick={onSwapClick}
        >
          <Icon name="fa-right-left" className="text-xs" />
        </div>
      </Tooltip>
    </div>
  )
}
