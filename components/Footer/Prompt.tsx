'use client'

import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useTaskStore } from '@/store/useTaskStore'
import { isErrorSub } from '@/lib/task'

export function FooterPrompt() {
  const { t } = useTranslation()
  const wf = useTaskStore(state => state.wf)
  const subtitle = useTaskStore(state => state.task.subtitle)
  useTaskStore(state => state.beginTime)
  useTaskStore(state => state.currentTime)

  if (!wf) return null

  const visible = subtitle.filter(item => wf.checkVisible(item.startTime, item.endTime))
  const errored = visible
    .map(item => ({ item, message: isErrorSub(subtitle, item, t) }))
    .filter(entry => entry.message)

  return (
    <div className="pointer-events-none absolute -top-7 left-0 right-0 w-full select-none text-xs">
      {errored.map(({ item, message }) => {
        const left = wf.getLeftFromTime(item.startTime)
        const width = wf.getWidthFromDuration(item.duration)
        return (
          <div
            key={item._id}
            className="prompt absolute top-0 flex items-center justify-center whitespace-nowrap text-center"
            style={{ left: Number.isFinite(left) ? left : 0, width: Number.isFinite(width) ? width : 0 }}
          >
            <div className="flex h-5 items-center gap-1 rounded bg-[#a10000] px-1 shadow-md">
              <Icon name="fa-bug" className="text-sm" />
              <div className="scale-95">{message}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
