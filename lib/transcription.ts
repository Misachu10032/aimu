import DT from 'duration-time-conversion'

interface WhisperSegment {
  start: number
  end: number
  text: string
}

interface SplitSegmentsInput {
  segments: WhisperSegment[]
  language?: string
}

export function addNewlineIfNeeded(text: string, maxLength: number, language?: string): string {
  if (text.length <= maxLength) {
    return text
  }

  if (language === 'english') {
    const words = text.split(' ')
    let result = ''
    let lineLength = 0

    words.forEach((word) => {
      if (lineLength + word.length + 1 > maxLength) {
        result += '\n'
        lineLength = 0
      }
      result += (lineLength > 0 ? ' ' : '') + word
      lineLength += word.length + 1
    })

    return result
  }
  else {
    const segments: string[] = []
    for (let i = 0; i < text.length; i += maxLength) {
      segments.push(text.slice(i, i + maxLength))
    }
    return segments.join('\n')
  }
}

export function splitSegments({ segments, language }: SplitSegmentsInput): { start: string, end: string, text: string }[] {
  const splitRegex = /[。；！？、.?!;]/
  const eastAsianLanguages = ['chinese', 'japanese', 'korean']
  const maxLength = eastAsianLanguages.includes(language || '') ? 20 : 50

  return segments
    .flatMap((segment) => {
      const sentences = segment.text
        .split(splitRegex)
        .filter(t => t.trim().length > 0)

      const newSegments: { start: number, end: number, text: string }[] = []
      let currentText = ''
      let currentTime = segment.start
      let segmentStart = currentTime

      sentences.forEach((sentence) => {
        const trimmedSentence = sentence.trim()
        if (currentText.length + trimmedSentence.length > maxLength) {
          const duration
            = (currentText.length / segment.text.length)
              * (segment.end - segment.start)
          if (currentText.trim().length > 0 && duration > 0) {
            newSegments.push({
              start: segmentStart,
              end: currentTime,
              text: addNewlineIfNeeded(currentText.trim(), maxLength, language),
            })
          }
          currentText = trimmedSentence
          segmentStart = currentTime
        }
        else {
          currentText += ` ${trimmedSentence}`
        }

        currentTime
          += (trimmedSentence.length / segment.text.length)
            * (segment.end - segment.start)
      })

      if (currentText.trim().length > 0 && segment.end - segmentStart > 0) {
        newSegments.push({
          start: segmentStart,
          end: segment.end,
          text: addNewlineIfNeeded(currentText.trim(), maxLength, language),
        })
      }

      return newSegments
    })
    .filter(segment => segment.text.length > 0 && segment.end - segment.start > 0)
    .filter(segment => !!segment.text.trim())
    .map(segment => ({
      start: DT.d2t(segment.start),
      end: DT.d2t(segment.end),
      text: segment.text,
    }))
}
