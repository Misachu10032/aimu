'use client'

import { useEffect, useRef } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStore } from '@/store/useTaskStore'
import { OPTION } from '@/config/OPTION'
import { d2t } from '@/lib/index'
import { isErrorSub } from '@/lib/task'
import type { Sub } from '@/lib/Sub'

type DragType = '' | 'left' | 'right'

function magnetically(time: number, closeTime: number | null | undefined): number {
  if (!closeTime) return time
  if (time > closeTime - 0.1 && closeTime + 0.1 > time) return closeTime
  return time
}

export function FooterItem({ item }: { item: Sub }) {
  const { t } = useTranslation()
  const itemRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypeRef = useRef<DragType>('')
  const lastXRef = useRef(0)
  const lastWidthRef = useRef(0)
  const lastDiffXRef = useRef(0)

  const wf = useTaskStore(state => state.wf)
  const subtitle = useTaskStore(state => state.task.subtitle)
  useTaskStore(state => state.beginTime)
  useTaskStore(state => state.currentTime)

  const index = subtitle.findIndex(sub => sub._id === item._id)
  const currentIndex = useTaskStore((state) => {
    return state.task.subtitle.findIndex(
      s => s.startTime <= state.currentTime && state.currentTime <= s.endTime,
    )
  })
  const current = currentIndex === index
  const errorMessage = isErrorSub(subtitle, item, t)
  const currentItem = useTaskStore(state => state.currentItem)
  const option = useTaskStore(state => state.task.option)
  const autoAlign = useAppStore(state => state.option.autoAlign)

  if (!wf) return null

  const rawLeft = wf.getLeftFromTime(item.startTime)
  const rawWidth = wf.getWidthFromDuration(item.duration)
  const left = Number.isFinite(rawLeft) ? rawLeft : 0
  const width = Number.isFinite(rawWidth) ? rawWidth : 0

  async function onClick() {
    useTaskStore.getState().setCurrentItem(item)
    const { duration, art, wf } = useTaskStore.getState()
    if (wf && art && duration >= item.startTime) {
      await wf.smoothSeek(item.startTime, 0.1)
      art.seek = item.startTime + 0.05
    }
  }

  function onDoubleClick() {
    const subtitle = useTaskStore.getState().task.subtitle
    const previous = subtitle[index - 1]
    const next = subtitle[index + 1]
    if (previous && next) {
      const startTime = previous.endTime
      const endTime = next.startTime
      useTaskStore.getState().updateSubtitleField(index, 'start', d2t(startTime))
      useTaskStore.getState().updateSubtitleField(index, 'end', d2t(endTime))
      const art = useTaskStore.getState().art
      if (art) art.seek = previous.endTime
    }
  }

  function onMouseDown(event: React.MouseEvent, type: DragType = '') {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current)
    const pageX = event.pageX
    pressTimerRef.current = setTimeout(() => {
      if (event.button !== 0 || !itemRef.current) return
      isDraggingRef.current = true
      lastTypeRef.current = type
      lastXRef.current = pageX
      lastWidthRef.current = Number.parseFloat(itemRef.current.style.width || `${width}`)
    }, 200)
  }

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      if (!isDraggingRef.current || !itemRef.current) return
      lastDiffXRef.current = event.pageX - lastXRef.current
      if (lastTypeRef.current === 'left') {
        itemRef.current.style.width = `${lastWidthRef.current - lastDiffXRef.current}px`
        itemRef.current.style.transform = `translate(${lastDiffXRef.current}px)`
      }
      else if (lastTypeRef.current === 'right') {
        itemRef.current.style.width = `${lastWidthRef.current + lastDiffXRef.current}px`
      }
      else {
        itemRef.current.style.transform = `translate(${lastDiffXRef.current}px)`
      }
    }

    function onMouseUp() {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current)
        pressTimerRef.current = null
      }
      if (!isDraggingRef.current || !itemRef.current || !wf) return
      isDraggingRef.current = false

      const timeDiff = wf.getDurationFromWidth(lastDiffXRef.current)
      const state = useTaskStore.getState()
      const currentSub = state.task.subtitle[index]
      const previous = state.task.subtitle[index - 1]
      const next = state.task.subtitle[index + 1]

      if (!currentSub) {
        itemRef.current.style.transform = 'translate(0)'
        return
      }

      const startTime = magnetically(
        currentSub.startTime + timeDiff,
        previous && autoAlign ? previous.endTime : null,
      )
      const endTime = magnetically(
        currentSub.endTime + timeDiff,
        next && autoAlign ? next.startTime : null,
      )

      if ((previous && endTime < previous.startTime) || (next && startTime > next.endTime)) {
        message.warning(t('task.timeError'))
      }
      else if (lastTypeRef.current === 'left') {
        if (startTime >= 0 && currentSub.endTime - startTime >= OPTION.MIN_SUB_TIME) {
          state.updateSubtitleField(index, 'start', d2t(startTime))
        }
        else {
          itemRef.current.style.width = `${lastWidthRef.current}px`
          message.warning(t('task.timeError'))
        }
      }
      else if (lastTypeRef.current === 'right') {
        if (endTime >= 0 && endTime - currentSub.startTime >= OPTION.MIN_SUB_TIME) {
          state.updateSubtitleField(index, 'end', d2t(endTime))
        }
        else {
          itemRef.current.style.width = `${lastWidthRef.current}px`
          message.warning(t('task.timeError'))
        }
      }
      else {
        if (startTime > 0 && endTime > 0 && endTime - startTime >= OPTION.MIN_SUB_TIME) {
          state.updateSubtitleField(index, 'start', d2t(startTime))
          state.updateSubtitleField(index, 'end', d2t(endTime))
        }
        else {
          itemRef.current.style.width = `${lastWidthRef.current}px`
          message.warning(t('task.timeError'))
        }
      }

      itemRef.current.style.transform = 'translate(0)'
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, wf, autoAlign])

  return (
    <div
      ref={itemRef}
      data-index={index}
      className={`pointer-events-auto absolute bottom-0 top-0 flex cursor-move select-none items-center justify-center overflow-hidden border border-white/20 text-[13px] text-white ${
        current && !errorMessage ? 'bg-[#502cab]/50' : ''
      } ${!current && !errorMessage ? 'bg-white/20' : ''} ${errorMessage ? 'bg-red-700/50' : ''} ${
        currentItem === item ? 'z-50 -mt-2 h-24' : ''
      }`}
      style={{ left, width }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={event => onMouseDown(event)}
    >
      <div
        className="absolute bottom-0 left-0 top-0 z-10 w-2 cursor-col-resize select-none hover:bg-white/20"
        onMouseDown={(event) => { event.stopPropagation(); onMouseDown(event, 'left') }}
      />
      <div className="relative z-0 flex h-full w-full flex-col items-center justify-center whitespace-nowrap">
        {(option.subtitleMode === 1 || option.subtitleMode === 2) && (
          <div className="text-[13px]">{item.text}</div>
        )}
        {(option.subtitleMode === 1 || option.subtitleMode === 3) && (
          <div className="text-[13px]">{item.text2}</div>
        )}
      </div>
      <div
        className="absolute bottom-0 right-0 top-0 z-10 w-2 cursor-col-resize select-none hover:bg-white/20"
        onMouseDown={(event) => { event.stopPropagation(); onMouseDown(event, 'right') }}
      />
      <div className="absolute left-0.5 top-0.5 text-xs leading-none text-white/70">{index}</div>
    </div>
  )
}
