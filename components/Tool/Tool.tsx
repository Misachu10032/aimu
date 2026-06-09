'use client'

import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/useAppStore'
import type { AppOption } from '@/store/useAppStore'
import { ToolStyle } from './Style'
import { ToolApi } from './Api'
import { ToolPlaceholder } from './Placeholder'

const TABS: { key: AppOption['tab'], icon: string, labelKey: string, label?: string }[] = [
  { key: 'style', icon: 'fa-palette', labelKey: 'tool.style' },
  { key: 'utils', icon: 'fa-screwdriver-wrench', labelKey: 'tool.utils' },
  { key: 'option', icon: 'fa-gear', labelKey: 'tool.option' },
  { key: 'api', icon: 'fa-key', labelKey: '', label: 'API' },
]

export function Tool() {
  const { t } = useTranslation()
  const tab = useAppStore(state => state.option.tab)
  const toolbar = useAppStore(state => state.option.toolbar)
  const setOption = useAppStore(state => state.setOption)

  function onTabClick(key: AppOption['tab']) {
    setOption('tab', key)
    setOption('toolbar', true)
  }

  return (
    <div className={`relative flex flex-col transition-[height] duration-300 ${toolbar ? 'h-52' : 'h-8'}`}>
      <div className={`flex h-8 items-center justify-between border-b ${toolbar ? 'border-[#1d1e23]' : 'border-transparent'}`}>
        <div className="flex h-full items-center text-[13px]">
          {TABS.map(item => (
            <div
              key={item.key}
              className={`relative flex h-full cursor-pointer items-center gap-1.5 border-r border-[#1d1e23] px-4 transition-all duration-300 ${
                tab === item.key ? 'bg-[#502cab] text-white' : 'text-white/70'
              }`}
              onClick={() => onTabClick(item.key)}
            >
              <Icon name={item.icon} />
              {item.label || t(item.labelKey)}
            </div>
          ))}
        </div>
        <div
          className="group flex h-8 w-8 cursor-pointer items-center justify-center text-base transition duration-300 hover:bg-[#502cab]"
          onClick={() => setOption('toolbar', !toolbar)}
        >
          <Icon
            name="fa-chevron-down"
            className={`text-white/50 transition duration-300 group-hover:scale-125 group-hover:text-white ${toolbar ? '' : 'rotate-180'}`}
          />
        </div>
      </div>
      <div
        className={`h-0 flex-1 overflow-y-auto bg-[#4b2ea5]/10 pt-1 text-[13px] leading-none text-white/50 transition duration-300 ${
          toolbar ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {tab === 'style' && <ToolStyle />}
        {tab === 'utils' && <ToolPlaceholder label={t('tool.utils')} />}
        {tab === 'option' && <ToolPlaceholder label={t('tool.option')} />}
        {tab === 'api' && <ToolApi />}
      </div>
    </div>
  )
}
