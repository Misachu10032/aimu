import { create } from 'zustand'
import cloneDeep from 'lodash/cloneDeep'
import { EXTEND } from '@/config/EXTEND'
import type { RawSub, TaskData } from '@/config/EXTEND'
import { fileToBlobUrl } from '@/lib/index'
import { getVideoInfo } from '@/lib/video'

interface CreateState {
  dialog: boolean
  uploaded: boolean
  analyzing: boolean
  analysisProgress: number
  task: TaskData

  setDialog: (open: boolean) => void
  setName: (name: string) => void
  reset: () => void
  onFileChange: (file: File) => Promise<boolean>
  setSubtitleType: (type: number) => void
  setLocalSubtitle: (file: File, subtitle: RawSub[]) => void
  setSubtitle: (subtitle: RawSub[]) => void
}

function initialTask(): TaskData {
  return cloneDeep(EXTEND)
}

export const useCreateStore = create<CreateState>((set, get) => ({
  dialog: false,
  uploaded: false,
  analyzing: false,
  analysisProgress: 0,
  task: initialTask(),

  setDialog: dialog => set({ dialog }),
  setName: name => set(state => ({
    task: { ...state.task, option: { ...state.task.option, name } },
  })),
  reset: () => set({ uploaded: false, analyzing: false, analysisProgress: 0, task: initialTask() }),

  onFileChange: async (file) => {
    const blobUrl = fileToBlobUrl(file)
    set({ analyzing: true })
    const info = await getVideoInfo(blobUrl, (progress) => {
      set({ analysisProgress: progress })
    })
    set({ analyzing: false })

    if (!info.canPlay || info.duration === Infinity || !info.duration) {
      return false
    }

    const task = cloneDeep(get().task)
    task.offline.canPlay = true
    task.offline.videoHasAudio = Boolean(info.hasAudio)
    task.offline.videoHasVideo = Boolean(info.hasVideo)
    task.offline.videoDuration = info.duration
    task.offline.videoPoster = info.poster || ''
    task.offline.thumbnail = info.thumbnail || task.offline.thumbnail
    task.offline.videoFile = file
    task.offline.videoBlobUrl = blobUrl
    task.option.videoType = 1

    if (!task.option.name.trim()) {
      task.option.name = file.name.slice(0, 100)
    }

    set({ task, uploaded: true })
    return true
  },

  setSubtitleType: type => set(state => ({
    task: { ...state.task, option: { ...state.task.option, subtitleType: type } },
  })),
  setLocalSubtitle: (file, subtitle) => set(state => ({
    task: {
      ...state.task,
      subtitle,
      offline: { ...state.task.offline, subtitleFile: file },
    },
  })),
  setSubtitle: subtitle => set(state => ({
    task: { ...state.task, subtitle },
  })),
}))
