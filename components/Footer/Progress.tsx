'use client'

import { useEffect, useRef, useState } from 'react'
import { useTaskStore } from '@/store/useTaskStore'
import { d2t } from '@/lib/index'

export function FooterProgress() {
  const progressRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [grabbing, setGrabbing] = useState(false)
  const [showTime, setShowTime] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [hoverTime, setHoverTime] = useState(0)
  const currentTime = useTaskStore(state => state.currentTime)
  const duration = useTaskStore(state => state.duration)
  const subtitle = useTaskStore(state => state.task.subtitle)

  useEffect(() => {
    const canvas = canvasRef.current
    const el = progressRef.current
    if (!canvas || !el) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const width = el.clientWidth
    const height = el.clientHeight
    ctx.fillStyle = 'rgb(255 255 255 / 10%)'
    ctx.clearRect(0, 0, width * 2, height * 2)
    if (!duration) return
    let lastLeft = -Infinity
    let lastWidth = 0
    for (const item of subtitle) {
      const left = (item.startTime / duration) * width * 2
      const w = (item.duration / duration) * width * 2
      const gap = 2
      if (left > lastLeft + lastWidth + gap) {
        ctx.fillRect(left, 0, w, height * 2)
        lastLeft = left
        lastWidth = w
      }
      else {
        lastWidth = Math.max(left + w, lastLeft + lastWidth) - lastLeft
        ctx.fillRect(lastLeft, 0, lastWidth, height * 2)
      }
    }
  }, [subtitle, duration])

  function getTime(event: React.MouseEvent | MouseEvent): number {
    const el = progressRef.current
    if (!el || !duration) return 0
    const rect = el.getBoundingClientRect()
    return ((event.pageX - rect.left) / rect.width) * duration
  }

  function onMouseDown(event: React.MouseEvent) {
    const art = useTaskStore.getState().art
    if (art) art.seek = getTime(event)
    if (event.button !== 0) return
    setGrabbing(true)
  }

  function onMouseMove(event: React.MouseEvent) {
    if (!duration) return
    const el = progressRef.current
    if (!el) return
    setShowTime(true)
    const timeWidth = 64
    const rect = el.getBoundingClientRect()
    const posWidth = event.pageX - rect.left
    if (posWidth <= timeWidth / 2) setTimeLeft(0)
    else if (posWidth > rect.width - timeWidth / 2) setTimeLeft(rect.width - timeWidth)
    else setTimeLeft(posWidth - timeWidth / 2)
    setHoverTime((posWidth / rect.width) * duration)
  }

  function onMouseLeave() {
    setShowTime(false)
  }

  useEffect(() => {
    function onDocMouseMove(event: MouseEvent) {
      if (!grabbing) return
      const art = useTaskStore.getState().art
      if (art) art.seek = getTime(event)
    }
    function onDocMouseUp() {
      setGrabbing(false)
    }
    document.addEventListener('mousemove', onDocMouseMove)
    document.addEventListener('mouseup', onDocMouseUp)
    document.body.classList.toggle('select-none', grabbing)
    return () => {
      document.removeEventListener('mousemove', onDocMouseMove)
      document.removeEventListener('mouseup', onDocMouseUp)
      document.body.classList.remove('select-none')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grabbing, duration])

  return (
    <div
      ref={progressRef}
      className="relative h-3 cursor-col-resize bg-[#0e0e0e]"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute bottom-0 left-0 top-0 z-0 inline-block overflow-hidden bg-[#730000]"
        style={{ width: duration ? `${(currentTime / duration) * 100}%` : 0 }}
      />
      <canvas
        ref={canvasRef}
        width={(progressRef.current?.clientWidth || 0) * 2}
        height={(progressRef.current?.clientHeight || 0) * 2}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />
      {showTime && duration > 0 && (
        <div
          className="time pointer-events-none absolute bottom-5 left-0 z-30 flex h-5 w-16 items-center justify-center rounded bg-[#502cab] text-center text-[13px] shadow-md"
          style={{ left: timeLeft }}
        >
          {d2t(hoverTime, true)}
        </div>
      )}
    </div>
  )
}
