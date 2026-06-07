import type { Sub } from '@/lib/Sub'
import { OPTION } from '@/config/OPTION'

export function isErrorSub(subtitle: Sub[], item: Sub, t: (key: string) => string): string {
  const { MIN_SUB_TIME } = OPTION
  const index = subtitle.indexOf(item)
  const previous = subtitle[index - 1]
  if (previous && previous.endTime > item.startTime) {
    return t('task.overlap')
  }
  if (item?.duration < MIN_SUB_TIME) {
    return t('task.tooShort')
  }
  return ''
}

export function findIndex(subtitle: Sub[], startTime: number): number {
  return (
    subtitle.findIndex((item, index) => {
      return (
        (startTime >= item.endTime && !subtitle[index + 1])
        || (item.startTime <= startTime && item.endTime > startTime)
        || (startTime >= item.endTime
          && subtitle[index + 1]
          && startTime < subtitle[index + 1].startTime)
      )
    }) + 1
  )
}
