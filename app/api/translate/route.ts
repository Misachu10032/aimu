import { NextRequest, NextResponse } from 'next/server'
import { LANGUAGES } from '@/config/LANGUAGES'

interface TranslateSubtitle {
  start: string
  end: string
  text: string
}

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

    const body = await request.json()
    const { subtitles, target_lang }: { subtitles: TranslateSubtitle[], target_lang: string } = body
    const target_value = LANGUAGES.find(item => item.value === target_lang)?.label || target_lang

    const subtitleTexts = subtitles.map((item, index) => {
      const timeInfo = `[${item.start} --> ${item.end}]`
      const text = item.text.trim() || '[empty]'
      return { index: index + 1, timeInfo, text }
    })

    const systemPrompt = `You are a professional subtitle translator. Translate the subtitles to [${target_value}].
IMPORTANT: You MUST return exactly ${subtitles.length} translations in the SAME ORDER as input.
For [empty] entries, return empty string.
Return a JSON object with this format: {"translations": [{"index": 1, "translation": "translated text"}, {"index": 2, "translation": "..."}, ...]}
Keep the index numbers from the input. Do not include any other text.`

    const res = await fetch(`${openaiApiUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Subtitles to translate:\n${JSON.stringify(subtitleTexts, null, 2)}` },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const errorBody = await res.text()
      return NextResponse.json({ message: errorBody || 'Translation request failed' }, { status: res.status })
    }

    const data = await res.json()
    const translatedText = data.choices[0].message.content as string

    let translations: string[] = []
    try {
      const parsed = JSON.parse(translatedText)
      const translationItems = parsed.translations || []

      if (translationItems.length > 0 && typeof translationItems[0] === 'object') {
        translationItems.sort((a: { index: number }, b: { index: number }) => a.index - b.index)
        translations = translationItems.map((item: { translation?: string }) => item.translation || '')
      }
      else {
        translations = translationItems
      }
    }
    catch {
      const lines = translatedText.split('\n').filter(line => line.trim())
      translations = lines.map((line) => {
        const match = line.match(/^\d+\.\s*(?:\[[^\]]+\]\s*)?(\S.*)?$/)
        if (match) {
          const text = (match[1] || '').trim()
          return text === '[empty]' ? '' : text
        }
        return line.replace(/^\d+\.\s+/, '').trim()
      })
    }

    while (translations.length < subtitles.length) {
      translations.push('')
    }
    if (translations.length > subtitles.length) {
      translations = translations.slice(0, subtitles.length)
    }

    return NextResponse.json(translations)
  }
  catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
