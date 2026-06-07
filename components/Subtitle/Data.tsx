'use client'

import { useEffect, useRef, useState } from 'react'
import { Button, Empty } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTaskStore, useCurrentIndex } from '@/store/useTaskStore'
import { Sub } from '@/lib/Sub'
import { SubtitleItem } from './Item'

const ROW_HEIGHT = 104

export function SubtitleData() {
  const { t } = useTranslation()
  const subtitle = useTaskStore(state => state.task.subtitle)
  const addSubtitle = useTaskStore(state => state.addSubtitle)
  const currentIndex = useCurrentIndex()
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [isHover, setIsHover] = useState(false)

  useEffect(() => {
    if (isHover || currentIndex < 0) return
    if (document.activeElement?.tagName === 'TEXTAREA') return
    const el = itemRefs.current.get(currentIndex)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentIndex, isHover])

  function onCreateClick() {
    addSubtitle(new Sub({ startTime: 0, endTime: 1, text: t('task.tmp') }))
  }

  return (
    <div
      ref={containerRef}
      className="relative h-0 flex-1"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {subtitle.length
        ? (
            <div className="h-full overflow-y-auto scroll-smooth">
              {subtitle.map((item, index) => (
                <div
                  key={item._id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(index, el)
                    else itemRefs.current.delete(index)
                  }}
                >
                  <SubtitleItem item={item} index={index} height={ROW_HEIGHT} />
                </div>
              ))}
            </div>
          )
        : (
            <div className="flex w-full flex-col items-center pt-6">
              <Empty description={t('task.noData')} />
              <div className="flex justify-center">
                <Button icon={<PlusOutlined />} color="default" variant="outlined" onClick={onCreateClick}>
                  {t('task.create')}
                </Button>
              </div>
            </div>
          )}
    </div>
  )
}
