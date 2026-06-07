'use client'

import { useEffect, useRef, useState } from 'react'
import clamp from 'lodash/clamp'
import { useTaskStore } from '@/store/useTaskStore'

export function FooterGrab() {
  const grabRef = useRef<HTMLDivElement>(null)
  const [grabbing, setGrabbing] = useState(false)
  const playingRef = useRef(false)
  const startXRef = useRef(0)
  const startTimeRef = useRef(0)

  function onMouseDown(event: React.MouseEvent) {
    if (event.button !== 0) return
    setGrabbing(true)
    startXRef.current = event.pageX
    const { art, currentTime } = useTaskStore.getState()
    startTimeRef.current = currentTime
    playingRef.current = Boolean(art?.playing)
    art?.pause()
  }

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      if (!grabbing || !grabRef.current) return
      const { art, wf, duration } = useTaskStore.getState()
      if (!art || !wf) return
      const width = grabRef.current.getBoundingClientRect().width
      const diffTime = ((event.pageX - startXRef.current) / width) * wf.options.duration!
      const currentTime = clamp(startTimeRef.current - diffTime, 0, duration)
      art.seek = currentTime
      wf.seek(currentTime)
    }
    function onMouseUp() {
      setGrabbing(false)
      startXRef.current = 0
      startTimeRef.current = 0
      if (playingRef.current) {
        useTaskStore.getState().art?.play()
      }
      playingRef.current = false
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.body.classList.toggle('select-none', grabbing)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.classList.remove('select-none')
    }
  }, [grabbing])

  return (
    <div
      ref={grabRef}
      className={`absolute left-0 right-0 top-0 h-[25%] w-full select-none border-t border-t-[#281753] bg-[#331473]/30 ${grabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={onMouseDown}
    />
  )
}
