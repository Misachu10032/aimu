import { SubtitleTop } from './Top'
import { SubtitleData } from './Data'
import { SubtitleDividerHandle } from './DividerHandle'

export function Subtitle({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex flex-col ${className}`}>
      <SubtitleTop />
      <SubtitleData />
      <SubtitleDividerHandle />
    </div>
  )
}
