'use client'

import { App, Dropdown } from 'antd'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStore } from '@/store/useTaskStore'
import { I18N } from '@/config/I18N'
import i18n from '@/i18n'
import packageJson from '@/package.json'
import { HeaderKey, HeaderMenu } from './Key'

function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent)
}

function Logo() {
  const { t } = useTranslation()
  return (
    <a
      href="/"
      className="flex shrink-0 cursor-pointer select-none items-center gap-2"
    >
      <img src="/logo.png" alt="logo" className="h-5" onError={e => (e.currentTarget.style.display = 'none')} />
      <div>{t('name')}</div>
      <div className="flex rounded-xl bg-white/5 px-1 py-0.5 text-xs text-[#d1b7fa]">
        v
        {packageJson.version}
      </div>
    </a>
  )
}

function CreateButton() {
  const { t } = useTranslation()
  const setPopup = useAppStore(state => state.setPopup)
  return (
    <HeaderMenu onClick={() => setPopup('create', true)}>
      <Icon name="fa-rocket-launch" className="text-xs" />
      {t('header.create')}
    </HeaderMenu>
  )
}

function ExportButton() {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const taskId = useTaskStore(state => state.task.id)
  const setPopup = useAppStore(state => state.setPopup)

  function onExport() {
    if (!taskId) {
      setPopup('create', true)
      message.warning(t('create.pleaseCreateTask'))
      return
    }
    setPopup('export', true)
  }

  return (
    <HeaderMenu onClick={onExport}>
      <Icon name="fa-cloud-arrow-down" className="text-xs" />
      {t('header.export')}
    </HeaderMenu>
  )
}

function UndoButton() {
  const { t } = useTranslation()
  const history = useTaskStore(state => state.history)
  const content = t('header.undo') + (isMacOS() ? '(⌘ + z)' : '(Ctrl + z)')
  return (
    <HeaderKey disabled={!history?.canUndo} content={content} onClick={() => history?.undo()}>
      <Icon name="fa-reply" className="text-xs" />
    </HeaderKey>
  )
}

function RedoButton() {
  const { t } = useTranslation()
  const history = useTaskStore(state => state.history)
  const content = t('header.redo') + (isMacOS() ? '(⇧ + ⌘ + z)' : '(ctrl + shift + z)')
  return (
    <HeaderKey disabled={!history?.canRedo} content={content} onClick={() => history?.redo()}>
      <Icon name="fa-reply" className="-scale-x-100 text-xs" />
    </HeaderKey>
  )
}

function KeyboardButton() {
  const { t } = useTranslation()
  const { message } = App.useApp()
  return (
    <HeaderKey content={t('header.keyboard')} onClick={() => message.info(t('header.keyboard'))}>
      <Icon name="fa-keyboard" className="text-xs" />
    </HeaderKey>
  )
}



function I18nSwitch() {
  const setOption = useAppStore(state => state.setOption)

  const items = I18N.map(item => ({ key: item.key, label: item.name }))

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => {
          i18n.changeLanguage(key)
          setOption('i18n', key)
        },
      }}
      trigger={['click']}
    >
      <div>
        <HeaderKey>
          <Icon name="fa-language" />
        </HeaderKey>
      </div>
    </Dropdown>
  )
}

export function Header() {
  return (
    <div className="relative flex h-12 items-center justify-between border-b border-[#1d1e23] px-4 text-[13px]">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="h-4 w-[1px] bg-white/20" />
        <div className="flex items-center gap-4">
          <CreateButton />
          <ExportButton />
        </div>
        <div className="h-4 w-[1px] bg-white/20" />
        <div className="flex items-center gap-4">
          <UndoButton />
          <RedoButton />
          <KeyboardButton />
        </div>
      </div>
      <div className="flex items-center justify-end gap-4">
        <div className="h-4 w-[1px] bg-white/20" />
        <I18nSwitch />
      </div>
    </div>
  )
}
