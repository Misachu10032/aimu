import { create } from 'zustand'
import cloneDeep from 'lodash/cloneDeep'
import type Artplayer from 'artplayer'
import type WFPlayer from 'wfplayer'
import { DEMO } from '@/config/DEMO'
import type { TaskData } from '@/config/EXTEND'
import { Sub } from '@/lib/Sub'

export interface Task extends Omit<TaskData, 'subtitle'> {
  subtitle: Sub[]
}

function format(task: TaskData): Task {
  const clone = cloneDeep(task)
  return {
    ...clone,
    subtitle: clone.subtitle.map(sub => new Sub(sub)),
  }
}

interface HistoryControls {
  undo: () => void
  redo: () => void
  clear: () => void
  canUndo: boolean
  canRedo: boolean
}

interface TaskState {
  wf: WFPlayer | null
  art: Artplayer | null
  duration: number
  beginTime: number
  currentTime: number
  artSize: { height: number, width: number }
  task: Task
  history: HistoryControls | null
  currentItem: Sub | null

  setArt: (art: Artplayer | null) => void
  setWf: (wf: WFPlayer | null) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setBeginTime: (time: number) => void
  setArtSize: (size: { height: number, width: number }) => void
  setHistory: (history: HistoryControls | null) => void
  setCurrentItem: (item: Sub | null) => void

  init: () => void
  create: (task: TaskData) => void
  setStyle: <K extends keyof Task['style']>(key: K, value: Task['style'][K]) => void
  setTaskOption: <K extends keyof Task['option']>(key: K, value: Task['option'][K]) => void

  replaceSubtitles: (subs: Sub[]) => void
  updateSubtitleField: (index: number, field: 'text' | 'text2' | 'start' | 'end', value: string) => void
  removeSubtitle: (index: number) => void
  insertSubtitleAfter: (index: number, sub: Sub) => void
  addSubtitle: (sub: Sub) => void
  mergeSubtitle: (index: number) => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  wf: null,
  art: null,
  duration: 0,
  beginTime: 0,
  currentTime: 0,
  artSize: { height: 0, width: 0 },
  task: format(DEMO),
  history: null,
  currentItem: null,

  setArt: art => set({ art }),
  setWf: wf => set({ wf }),
  setCurrentTime: currentTime => set({ currentTime }),
  setDuration: duration => set({ duration }),
  setBeginTime: beginTime => set({ beginTime }),
  setArtSize: artSize => set({ artSize }),
  setHistory: history => set({ history }),
  setCurrentItem: currentItem => set({ currentItem }),

  init: () => {
    set({ task: format(DEMO) })
    get().history?.clear()
  },
  create: (task) => {
    const formatted = format(task)
    formatted.id = `${Date.now()}`
    set({ task: formatted })
    get().history?.clear()
  },
  setStyle: (key, value) => set(state => ({
    task: { ...state.task, style: { ...state.task.style, [key]: value } },
  })),
  setTaskOption: (key, value) => set(state => ({
    task: { ...state.task, option: { ...state.task.option, [key]: value } },
  })),

  replaceSubtitles: subs => set(state => ({
    task: { ...state.task, subtitle: subs },
  })),
  updateSubtitleField: (index, field, value) => set((state) => {
    const sub = state.task.subtitle[index]
    if (!sub) return state
    const updated = sub.clone
    updated[field] = value
    const subtitle = [...state.task.subtitle]
    subtitle[index] = updated
    return { task: { ...state.task, subtitle } }
  }),
  removeSubtitle: index => set((state) => {
    const subtitle = [...state.task.subtitle]
    subtitle.splice(index, 1)
    return { task: { ...state.task, subtitle } }
  }),
  insertSubtitleAfter: (index, sub) => set((state) => {
    const subtitle = [...state.task.subtitle]
    subtitle.splice(index + 1, 0, sub)
    return { task: { ...state.task, subtitle } }
  }),
  addSubtitle: sub => set(state => ({
    task: { ...state.task, subtitle: [...state.task.subtitle, sub] },
  })),
  mergeSubtitle: index => set((state) => {
    const subtitle = [...state.task.subtitle]
    const current = subtitle[index]
    const next = subtitle[index + 1]
    if (current && next) {
      const merged = current.clone
      merged.end = next.end
      merged.text += next.text
      merged.text2 += next.text2
      subtitle[index] = merged
      subtitle.splice(index + 1, 1)
    }
    return { task: { ...state.task, subtitle } }
  }),
}))

export function useCurrentIndex(): number {
  return useTaskStore((state) => {
    return state.task.subtitle.findIndex(
      item => item.startTime <= state.currentTime && state.currentTime <= item.endTime,
    )
  })
}

export function useCurrentSubtitles(): Sub[] {
  const wf = useTaskStore(state => state.wf)
  const subtitle = useTaskStore(state => state.task.subtitle)
  useTaskStore(state => state.beginTime)
  useTaskStore(state => state.currentTime)
  if (!wf) return []
  return subtitle.filter(item => wf.checkVisible(item.startTime, item.endTime))
}
