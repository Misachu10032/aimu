'use client'

import { Button, message, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStore } from '@/store/useTaskStore'
import { LANGUAGES } from '@/config/LANGUAGES'
import { useTranslate } from '@/hooks/useTranslate'

export function SubtitleTranslate() {
  const { t } = useTranslation()
  const tooltip = useAppStore(state => state.option.tooltip)
  const translateTo = useTaskStore(state => state.task.option.translateTo)
  const setTaskOption = useTaskStore(state => state.setTaskOption)
  const { loading, percentage, handleTranslate } = useTranslate()

  async function onClick() {
    try {
      await handleTranslate()
    }
    catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (msg === t('translate.subtitleEmpty')) {
        message.warning(msg)
      }
      else {
        message.error(msg)
      }
    }
  }

  return (
    <div className="flex h-full shrink-0 items-center gap-2 px-3 text-[13px]">
      <div className="flex items-center gap-1 text-white/60">
        {loading && <Icon name="fa-loader" className="animate-spin text-xs text-yellow-400" />}
        {t('translate.name')}
        :
      </div>
      <Select
        value={translateTo || undefined}
        allowClear
        showSearch
        disabled={loading}
        className="!w-36"
        placeholder={t('translate.placeholder') as string}
        title={tooltip ? (t('translate.placeholder') as string) : undefined}
        options={LANGUAGES.map(item => ({ value: item.value, label: item.label }))}
        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        onChange={value => setTaskOption('translateTo', value || '')}
      />
      <Button
        disabled={!translateTo}
        onClick={onClick}
        title={tooltip ? (t('header.translateTip') as string) : undefined}
        className="!border-none !bg-[#752522] !text-white hover:!bg-[#8a2e2a]"
      >
        {loading ? `${Math.floor(percentage)}% ${t('translate.stop')}` : t('translate.start')}
      </Button>
    </div>
  )
}
