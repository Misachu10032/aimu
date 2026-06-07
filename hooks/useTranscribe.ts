import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { Sub } from '@/lib/Sub'

const MAX_WHISPER_FILE_SIZE = 25 * 1024 * 1024

export function useTranscribe() {
  const { t } = useTranslation()

  async function transcribeAudio(file: File): Promise<Sub[]> {
    if (file.size > MAX_WHISPER_FILE_SIZE) {
      throw new Error(t('create.audioSizeLimit') as string)
    }

    const { openaiApiKey, openaiApiUrl } = useAppStore.getState().option
    const params = new URLSearchParams()
    if (openaiApiKey) params.set('openaiApiKey', openaiApiKey)
    if (openaiApiUrl) params.set('openaiApiUrl', openaiApiUrl)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`/api/transcriptions?${params.toString()}`, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Transcription request failed')
    }

    return (data as { start: string, end: string, text: string }[])
      .map(item => new Sub(item))
      .filter(item => item.check)
  }

  return { transcribeAudio }
}
