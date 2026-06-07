import { useEffect } from 'react'
import { useTaskStore } from '@/store/useTaskStore'
import { getKeyCode, t2d, d2t } from '@/lib/index'

export function useKeyboard() {
  useEffect(() => {
    function isFullscreen() {
      const art = useTaskStore.getState().art
      return art?.fullscreen || art?.fullscreenWeb
    }

    function onKeyDown(event: KeyboardEvent) {
      const code = getKeyCode(event)
      const state = useTaskStore.getState()
      const art = state.art
      if (!art) return

      switch (code) {
        case 'Space':
          event.preventDefault()
          art.toggle()
          break
        case 'KeyZ':
          event.preventDefault()
          if (event.metaKey && event.shiftKey) {
            if (state.history?.canRedo) state.history.redo()
          }
          else if (event.metaKey || event.ctrlKey) {
            if (event.shiftKey) {
              if (state.history?.canRedo) state.history.redo()
            }
            else if (state.history?.canUndo) {
              state.history.undo()
            }
          }
          break
        case 'ArrowUp': {
          event.preventDefault()
          if (isFullscreen()) {
            art.volume += 0.1
          }
          else {
            const subtitle = state.task.subtitle
            const currentIndex = subtitle.findIndex(
              item => item.startTime <= state.currentTime && state.currentTime <= item.endTime,
            )
            if (currentIndex === -1 && subtitle.length) {
              for (let index = 0; index < subtitle.length; index++) {
                const prev = subtitle[index - 1]
                const next = subtitle[index]
                if (state.currentTime > (prev?.endTime ?? -Infinity) && state.currentTime < (next?.startTime ?? Infinity)) {
                  art.seek = prev.startTime + 0.01
                  return
                }
              }
              art.seek = subtitle[0].startTime + 0.01
            }
            else {
              const sub = subtitle[currentIndex - 1]
              if (sub) art.seek = sub.startTime + 0.01
            }
          }
          break
        }
        case 'ArrowDown': {
          event.preventDefault()
          if (isFullscreen()) {
            art.volume -= 0.1
          }
          else {
            const subtitle = state.task.subtitle
            const currentIndex = subtitle.findIndex(
              item => item.startTime <= state.currentTime && state.currentTime <= item.endTime,
            )
            if (currentIndex === -1 && subtitle.length) {
              for (let index = 0; index < subtitle.length; index++) {
                const prev = subtitle[index - 1]
                const next = subtitle[index]
                if (state.currentTime > (prev?.endTime ?? -Infinity) && state.currentTime < (next?.startTime ?? Infinity)) {
                  art.seek = next.startTime + 0.01
                  return
                }
              }
              art.seek = subtitle[0].startTime + 0.01
            }
            else {
              const sub = subtitle[currentIndex + 1]
              if (sub) art.seek = sub.startTime + 0.01
            }
          }
          break
        }
        case 'ArrowLeft': {
          event.preventDefault()
          if (isFullscreen()) {
            art.backward = 5
          }
          else {
            const subtitle = state.task.subtitle
            const currentIndex = subtitle.findIndex(
              item => item.startTime <= state.currentTime && state.currentTime <= item.endTime,
            )
            const sub = subtitle[currentIndex]
            if (sub) {
              const startTime = t2d(sub.start) - 0.1
              state.updateSubtitleField(currentIndex, 'start', d2t(startTime))
              state.updateSubtitleField(currentIndex, 'end', d2t(t2d(sub.end) - 0.1))
              art.seek = startTime + 0.01
            }
          }
          break
        }
        case 'ArrowRight': {
          event.preventDefault()
          if (isFullscreen()) {
            art.forward = 5
          }
          else {
            const subtitle = state.task.subtitle
            const currentIndex = subtitle.findIndex(
              item => item.startTime <= state.currentTime && state.currentTime <= item.endTime,
            )
            const sub = subtitle[currentIndex]
            if (sub) {
              const startTime = t2d(sub.start) + 0.1
              state.updateSubtitleField(currentIndex, 'start', d2t(startTime))
              state.updateSubtitleField(currentIndex, 'end', d2t(t2d(sub.end) + 0.1))
              art.seek = startTime + 0.01
            }
          }
          break
        }
        case 'Backspace':
        case 'Delete': {
          event.preventDefault()
          const subtitle = state.task.subtitle
          const currentIndex = subtitle.findIndex(
            item => item.startTime <= state.currentTime && state.currentTime <= item.endTime,
          )
          if (subtitle[currentIndex]) {
            state.removeSubtitle(currentIndex)
          }
          break
        }
        case 'Escape':
          if (art.fullscreenWeb) {
            art.fullscreenWeb = false
          }
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}
