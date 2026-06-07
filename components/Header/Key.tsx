'use client'

import { Tooltip } from 'antd'
import { useAppStore } from '@/store/useAppStore'

export function HeaderKey({
  content = '',
  disabled = false,
  onClick,
  children,
}: {
  content?: string
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  const tooltip = useAppStore(state => state.option.tooltip)

  return (
    <Tooltip title={disabled || !content || !tooltip ? undefined : content}>
      <div
        className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded bg-[#15161a] transition duration-300 ${
          disabled ? 'text-white/30' : 'text-white/80 hover:bg-[#4b2ea5] hover:text-white'
        }`}
        onClick={disabled ? undefined : onClick}
      >
        {children}
      </div>
    </Tooltip>
  )
}

export function HeaderMenu({
  onClick,
  children,
}: {
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="flex h-7 shrink-0 cursor-pointer select-none items-center gap-1.5 rounded bg-white/10 px-3 text-[13px] transition duration-300 hover:bg-[#4b2ea5]"
      onClick={onClick}
    >
      {children}
    </div>
  )
}
