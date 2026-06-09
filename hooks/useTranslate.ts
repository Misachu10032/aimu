import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { useTaskStore } from '@/store/useTaskStore'

const BATCH_SIZE = 20

export function useTranslate() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [percentage, setPercentage] = useState(0)
  const shouldStopRef = useRef(false)

  async function translate(subtitleItems: { start: string, end: string, text: string }[], target_lang: string) {
    const { openaiApiKey, openaiApiUrl } = useAppStore.getState().option
    const params = new URLSearchParams()
    if (openaiApiKey) params.set('openaiApiKey', openaiApiKey)
    if (openaiApiUrl) params.set('openaiApiUrl', openaiApiUrl)

    const res = await fetch(`/api/translate?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtitles: subtitleItems, target_lang }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Translation request failed')
    }
    return data as string[]
  }

  async function startTranslation() {
    setLoading(true)
    setPercentage(0)
    shouldStopRef.current = false

    const subtitle = useTaskStore.getState().task.subtitle
    const targetLang = useTaskStore.getState().task.option.translateTo
    const updateSubtitleField = useTaskStore.getState().updateSubtitleField

    const batches: { start: string, end: string, text: string }[][] = []
    for (let i = 0; i < subtitle.length; i += BATCH_SIZE) {
      batches.push(subtitle.slice(i, i + BATCH_SIZE).map(item => ({ start: item.start, end: item.end, text: item.text })))
    }

    let processedCount = 0
    const totalCount = subtitle.length

    try {
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        if (shouldStopRef.current) break

        const batch = batches[batchIndex]
        const translations = await translate(batch, targetLang)

        if (translations.length !== batch.length) {
          console.warn(`Translation count mismatch: expected ${batch.length}, got ${translations.length}`)
        }

        batch.forEach((_, index) => {
          const globalIndex = batchIndex * BATCH_SIZE + index
          updateSubtitleField(globalIndex, 'text2', translations[index] || '')
        })

        processedCount += batch.length
        setPercentage((processedCount / totalCount) * 100)
      }
    }
    catch (error) {
      shouldStopRef.current = false
      setLoading(false)
      setPercentage(0)
      throw error
    }

    setLoading(false)
    setPercentage(0)
    shouldStopRef.current = false
  }

  async function handleTranslate() {
    if (loading) {
      shouldStopRef.current = true
      setLoading(false)
      setPercentage(0)
      return
    }

    if (useTaskStore.getState().task.subtitle.length === 0) {
      throw new Error(t('translate.subtitleEmpty') as string)
    }

    await startTranslation()
  }

  return { loading, percentage, handleTranslate }
}
