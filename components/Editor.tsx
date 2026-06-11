'use client'

import { Header } from '@/components/Header/Header'
import { Player } from '@/components/Player/Player'
import { Tool } from '@/components/Tool/Tool'
import { Subtitle } from '@/components/Subtitle/Subtitle'
import { Footer } from '@/components/Footer/Footer'
import { CreateDialog } from '@/components/Dialogs/CreateDialog'
import { ExportDialog } from '@/components/Dialogs/ExportDialog'
import { useAppStore } from '@/store/useAppStore'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useSubtitleHistory } from '@/hooks/useSubtitleHistory'

export default function Editor() {
  const splitX = useAppStore(state => state.option.splitX)

  useKeyboard()
  useSubtitleHistory()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0e0e0e]">
      <Header />
      <div id="main" className="flex h-0 flex-1 justify-between border-b border-[#1d1e23]">
        <div
          className="flex flex-col border-r border-[#1d1e23]"
          style={{ width: `${splitX * 100}%` }}
        >
          <Player className="flex-1 border-b border-[#1d1e23] bg-[#1d1e23]" />
          <Tool />
        </div>
        <Subtitle className="flex-1" />
      </div>
      <Footer className="h-40" />
      <CreateDialog />
      <ExportDialog />
    </div>
  )
}
