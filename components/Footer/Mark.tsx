'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTaskStore } from '@/store/useTaskStore'
import { OPTION } from '@/config/OPTION'
import { Sub } from '@/lib/Sub'
import { findIndex } from '@/lib/task'
import { getKeyCode } from '@/lib/index'

export function FooterMark() {
  const { t } = useTranslation()
  const beginTime = useTaskStore(state => state.beginTime)
  const currentTime = useTaskStore(state => state.currentTime)
  const wf = useTaskStore(state => state.wf)
  const insertSubtitleAfter = useTaskStore(state => state.insertSubtitleAfter)

  const isMarkRef = useRef(false)
  const isDragRef = useRef(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragEnd, setDragEnd] = useState(0)

  const left = wf && dragStart ? wf.getLeftFromTime(dragStart) : 0
  const width = wf && dragEnd > dragStart ? wf.getWidthFromDuration(dragEnd - dragStart) : 0

  function createSubtitle(start: number, end: number) {
    const subtitle = useTaskStore.getState().task.subtitle
    const index = findIndex(subtitle, start)
    insertSubtitleAfter(index - 1, new Sub({ startTime: start, endTime: end, text: t('task.tmp') }))
  }

  function onMouseDown(event: React.MouseEvent) {
    if (event.button !== 0 || !wf) return
    isDragRef.current = true
    setDragStart(wf.getCurrentTimeFromEvent(event.nativeEvent))
  }

  function onMouseMove(event: React.MouseEvent) {
    if (isDragRef.current && wf) {
      setDragEnd(wf.getCurrentTimeFromEvent(event.nativeEvent))
    }
  }

  useEffect(() => {
    function onMouseUp() {
      if (isDragRef.current && dragStart > 0 && dragEnd > 0 && dragEnd - dragStart >= OPTION.MIN_SUB_TIME) {
        createSubtitle(dragStart, dragEnd)
      }
      isDragRef.current = false
      setDragStart(0)
      setDragEnd(0)
    }
    function onKeyDown(event: KeyboardEvent) {
      const code = getKeyCode(event)
      if (code !== 'KeyM') return
      if (dragStart) {
        if (isMarkRef.current && dragStart > 0 && dragEnd > 0 && dragEnd - dragStart >= OPTION.MIN_SUB_TIME) {
          createSubtitle(dragStart, dragEnd)
          setDragStart(0)
          setDragEnd(0)
          isMarkRef.current = false
        }
      }
      else {
        isMarkRef.current = true
        setDragStart(currentTime)
      }
    }
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragStart, dragEnd, currentTime])

  useEffect(() => {
    if (isMarkRef.current) setDragEnd(currentTime)
  }, [currentTime])

  return (
    <div
      className="absolute left-0 right-0 top-12 z-20 h-20 w-full"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
    >
      {dragStart > 0 && dragEnd > dragStart && (
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-full select-none border border-white/20 bg-[#64d98a]/50"
          style={{ left, width }}
        />
      )}
    </div>
  )
}
