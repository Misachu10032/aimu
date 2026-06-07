import { useEffect, useRef } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { useTaskStore } from '@/store/useTaskStore'
import type { Sub } from '@/lib/Sub'

const CAPACITY = 200

export function useSubtitleHistory() {
  const subtitle = useTaskStore(state => state.task.subtitle)
  const pastRef = useRef<Sub[][]>([])
  const futureRef = useRef<Sub[][]>([])
  const lastRef = useRef<Sub[]>(subtitle)
  const skipRef = useRef(false)
  const initializedRef = useRef(false)

  function publish() {
    useTaskStore.getState().setHistory({
      undo,
      redo,
      clear,
      canUndo: pastRef.current.length > 0,
      canRedo: futureRef.current.length > 0,
    })
  }

  function undo() {
    if (!pastRef.current.length) return
    const previous = pastRef.current.pop()!
    futureRef.current.push(cloneDeep(lastRef.current))
    skipRef.current = true
    lastRef.current = previous
    useTaskStore.getState().replaceSubtitles(previous)
    publish()
  }

  function redo() {
    if (!futureRef.current.length) return
    const next = futureRef.current.pop()!
    pastRef.current.push(cloneDeep(lastRef.current))
    skipRef.current = true
    lastRef.current = next
    useTaskStore.getState().replaceSubtitles(next)
    publish()
  }

  function clear() {
    pastRef.current = []
    futureRef.current = []
    lastRef.current = useTaskStore.getState().task.subtitle
    publish()
  }

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      lastRef.current = subtitle
      publish()
      return
    }

    if (skipRef.current) {
      skipRef.current = false
      lastRef.current = subtitle
      return
    }

    pastRef.current.push(cloneDeep(lastRef.current))
    if (pastRef.current.length > CAPACITY) pastRef.current.shift()
    futureRef.current = []
    lastRef.current = subtitle
    publish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitle])

  useEffect(() => {
    return () => useTaskStore.getState().setHistory(null)
  }, [])
}
