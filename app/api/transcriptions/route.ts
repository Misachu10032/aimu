import { NextRequest, NextResponse } from 'next/server'
import { splitSegments } from '@/lib/transcription'

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const openaiApiKey = searchParams.get('openaiApiKey') || process.env.OPENAI_API_KEY
    const openaiApiUrl = searchParams.get('openaiApiUrl') || process.env.OPENAI_API_URL

    if (!openaiApiKey) {
      return NextResponse.json({ message: 'OpenAI API KEY is missing in .env or API options' }, { status: 500 })
    }

    if (!openaiApiUrl) {
      return NextResponse.json({ message: 'OpenAI API URL is missing in .env or API options' }, { status: 500 })
    }

    const incomingForm = await request.formData()
    const file = incomingForm.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ message: 'Audio file is required' }, { status: 400 })
    }

    const openaiFormData = new FormData()
    openaiFormData.append('file', file, file instanceof File ? file.name : 'audio.mp3')
    openaiFormData.append('model', 'whisper-1')
    openaiFormData.append('response_format', 'verbose_json')

    const res = await fetch(`${openaiApiUrl}/v1/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: openaiFormData,
    })

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null)
      return NextResponse.json({ message: errorBody?.error?.message || 'Transcription request failed' }, { status: res.status })
    }

    const result = await res.json()
    return NextResponse.json(splitSegments(result))
  }
  catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
