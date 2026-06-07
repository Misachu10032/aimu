'use client'

import { useEffect, useRef } from 'react'
import clamp from 'lodash/clamp'
import { useTaskStore } from '@/store/useTaskStore'
import { FooterWaveform } from './Waveform'
import { FooterGrab } from './Grab'
import { FooterMark } from './Mark'
import { FooterPrompt } from './Prompt'
import { FooterProgress } from './Progress'
import { FooterTip } from './Tip'
import { FooterSubtitleList } from './SubtitleList'

export function Footer({ className = '' }: { className?: string }) {
  const footerRef = useRef<HTMLDivElement>(null)
  const art = useTaskStore(state => state.art)
  const duration = useTaskStore(state => state.duration)

  useEffect(() => {
    function onWheel(event: WheelEvent) {
      const { art, wf, currentTime, duration } = useTaskStore.getState()
      if (art && wf && footerRef.current?.contains(event.target as Node)) {
        const deltaY = (Math.sign(event.deltaY) * (wf.options.duration || 20)) / 50
        const time = clamp(currentTime + deltaY, 0, duration)
        art.seek = time
        wf.seek(time)
      }
    }
    window.addEventListener('wheel', onWheel)
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div ref={footerRef} className={`relative flex flex-col ${className}`}>
      <FooterPrompt />
      <FooterProgress />
      <div className="relative h-0 flex-1">
        {art && <FooterWaveform />}
        {art && <FooterGrab />}
        {art && <FooterMark />}
        {art && duration > 0 && <FooterSubtitleList />}
      </div>
      <FooterTip />
    </div>
  )
}
