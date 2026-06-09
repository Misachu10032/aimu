'use client'

import { Input } from 'antd'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/useAppStore'

export function ToolApi() {
  const openaiApiKey = useAppStore(state => state.option.openaiApiKey)
  const openaiApiUrl = useAppStore(state => state.option.openaiApiUrl)
  const setOption = useAppStore(state => state.setOption)

  return (
    <div className="flex flex-col">
      <div className="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
        <a
          href="https://platform.openai.com/usage"
          target="_blank"
          rel="noreferrer"
          className="flex h-6 w-32 shrink-0 cursor-pointer items-center gap-2 text-white hover:text-blue-500 hover:underline"
        >
          <Icon name="fa-up-right-from-square" />
          OpenAI API KEY
        </a>
        <div className="flex w-0 flex-1 shrink-0 items-center">
          <Input
            value={openaiApiKey}
            allowClear
            size="small"
            maxLength={200}
            className="rounded bg-black/20"
            placeholder={`sk-${'*'.repeat(48)}`}
            onChange={e => setOption('openaiApiKey', e.target.value.trim())}
          />
        </div>
      </div>
      <div className="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
        <a
          href="https://platform.openai.com/usage"
          target="_blank"
          rel="noreferrer"
          className="flex h-6 w-32 shrink-0 cursor-pointer items-center gap-2 text-white hover:text-blue-500 hover:underline"
        >
          <Icon name="fa-up-right-from-square" />
          OpenAI API URL
        </a>
        <div className="flex w-0 flex-1 shrink-0 items-center">
          <Input
            value={openaiApiUrl}
            allowClear
            size="small"
            maxLength={200}
            className="rounded bg-black/20"
            placeholder="https://api.openai.com"
            onChange={e => setOption('openaiApiUrl', e.target.value.trim())}
          />
        </div>
      </div>
    </div>
  )
}
