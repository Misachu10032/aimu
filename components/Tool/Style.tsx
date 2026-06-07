'use client'

import { ColorPicker, Select, Slider, Switch } from 'antd'
import { useTranslation } from 'react-i18next'
import { useTaskStore } from '@/store/useTaskStore'
import { FONTS } from '@/config/FONTS'
import { alphaToNum, colorToAss, colorToHtml, readColor } from '@/lib/subtitle'
import type { Task } from '@/store/useTaskStore'

function ColorField({ label, value, onChange }: { label: string, value: string, onChange: (color: { r: number, g: number, b: number }) => void }) {
  const html = colorToHtml(readColor(value))
  return (
    <div className="flex items-center gap-1">
      {label}
      <ColorPicker
        size="small"
        value={html}
        onChangeComplete={(color) => {
          const { r, g, b } = color.toRgb()
          onChange({ r, g, b })
        }}
      />
    </div>
  )
}

export function ToolStyle() {
  const { t } = useTranslation()
  const style = useTaskStore(state => state.task.style)
  const setStyle = useTaskStore(state => state.setStyle)

  function setColor(key: keyof Task['style']) {
    return (color: { r: number, g: number, b: number }) => {
      setStyle(key, colorToAss(color) as never)
    }
  }

  const backAlpha = alphaToNum(style.BackColour)

  return (
    <div className="flex flex-col">
      <div className="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
        <div className="flex h-6 shrink-0 items-center text-white">
          {t('style.color')}
          :
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <ColorField label={t('style.primaryColour')} value={style.PrimaryColour} onChange={setColor('PrimaryColour')} />
          <ColorField label={t('style.outlineColour')} value={style.OutlineColour} onChange={setColor('OutlineColour')} />
          <ColorField label={t('style.secondaryColour')} value={style.SecondaryColour} onChange={setColor('SecondaryColour')} />
          <ColorField label={t('style.secondaryOutlineColour')} value={style.SecondaryOutlineColour} onChange={setColor('SecondaryOutlineColour')} />
        </div>
      </div>

      <div className="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
        <div className="flex h-6 shrink-0 items-center text-white">
          {t('style.size')}
          :
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <div className="flex items-center gap-1.5">
            {t('style.fontSize')}
            <div className="flex h-4 w-24 items-center">
              <Slider
                className="!w-full"
                min={14}
                max={30}
                step={1}
                value={style.Fontsize}
                onChange={value => setStyle('Fontsize', value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {t('style.spacing')}
            <div className="flex h-4 w-24 items-center">
              <Slider
                className="!w-full"
                min={0}
                max={5}
                step={1}
                value={style.Spacing}
                onChange={value => setStyle('Spacing', value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {t('style.marginV')}
            <div className="flex h-4 w-24 items-center">
              <Slider
                className="!w-full"
                min={0}
                max={100}
                step={1}
                value={style.MarginV}
                onChange={value => setStyle('MarginV', value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
        <div className="flex h-6 shrink-0 items-center text-white">
          {t('style.shadow')}
          :
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <div className="flex items-center gap-1">
            {t('style.background')}
            <Switch
              size="small"
              checked={style.BorderStyle === 4}
              onChange={(checked) => {
                setStyle('BorderStyle', checked ? 4 : 1)
              }}
            />
          </div>
          <div className="flex items-center gap-1">
            {t('style.backColour')}
            <div className="flex h-4 w-24 items-center">
              <Slider
                className="!w-full"
                min={0}
                max={250}
                step={10}
                value={backAlpha}
                onChange={(value) => {
                  const hex = value.toString(16)
                  setStyle('BackColour', `&H${hex.length === 1 ? `0${hex}` : hex}000000`)
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            {t('style.Outline')}
            <div className="flex h-4 w-24 items-center">
              <Slider
                className="!w-full"
                min={1}
                max={3}
                step={1}
                value={style.Outline}
                onChange={value => setStyle('Outline', value)}
              />
            </div>
          </div>
          {style.BorderStyle === 1 && (
            <div className="flex items-center gap-1">
              {t('style.Shadow')}
              <div className="flex h-4 w-24 items-center">
                <Slider
                  className="!w-full"
                  min={0}
                  max={3}
                  step={1}
                  value={style.Shadow}
                  onChange={value => setStyle('Shadow', value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex h-10 items-center gap-2 px-3">
        <div className="flex h-6 shrink-0 items-center text-white">
          {t('style.font')}
          :
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <Select
            className="!w-36"
            size="small"
            value={style.Fontname}
            onChange={value => setStyle('Fontname', value)}
            options={FONTS.map(font => ({
              value: font.name,
              label: font.type === 'cn' ? (t(`fonts.${font.name}`) as string) : font.name,
            }))}
          />
          <div className="flex items-center gap-1">
            {t('style.bold')}
            <Switch size="small" checked={style.Bold === -1} onChange={checked => setStyle('Bold', checked ? -1 : 0)} />
          </div>
          <div className="flex items-center gap-1">
            {t('style.italic')}
            <Switch size="small" checked={style.Italic === -1} onChange={checked => setStyle('Italic', checked ? -1 : 0)} />
          </div>
        </div>
      </div>
    </div>
  )
}
