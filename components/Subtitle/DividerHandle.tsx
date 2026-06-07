'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function SubtitleDividerHandle() {
  const setOption = useAppStore(state => state.setOption)
  const [grabbing, setGrabbing] = useState(false)
  const cacheX = useRef(0)
  const cacheSplit = useRef(0)
  const width = useRef(0)

  function onMouseDown(event: React.MouseEvent) {
    if (event.button !== 0) return
    setGrabbing(true)
    const main = document.querySelector('#main')
    width.current = main?.clientWidth || 0
    cacheX.current = event.pageX
    cacheSplit.current = useAppStore.getState().option.splitX
  }

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      if (!grabbing) return
      const split = (event.pageX - cacheX.current) / width.current + cacheSplit.current
      if (split < 0.7 && split > 0.3) {
        setOption('splitX', split)
      }
    }
    function onMouseUp() {
      setGrabbing(false)
      cacheX.current = 0
      width.current = 0
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.body.classList.toggle('select-none', grabbing)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.classList.remove('select-none')
    }
  }, [grabbing, setOption])

  return (
    <div
      className="group/split absolute -left-1.5 bottom-0 top-0 flex h-full w-3 cursor-col-resize select-none justify-center"
      onMouseDown={onMouseDown}
    >
      <div className={`h-full w-[1px] bg-[#d1b7fa] transition duration-300 ${grabbing ? 'opacity-100' : 'opacity-0 group-hover/split:opacity-100'}`} />
    </div>
  )
}
