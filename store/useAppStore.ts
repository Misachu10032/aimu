import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppOption {
  tab: 'style' | 'utils' | 'option' | 'api'
  tooltip: boolean
  toolbar: boolean
  autoAlign: boolean
  i18n: string
  splitX: number
  openaiApiKey: string
  openaiApiUrl: string
}

interface AppState {
  popup: {
    create: boolean
    help: boolean
    export: boolean
    keyboard: boolean
  }
  option: AppOption
  setPopup: (key: keyof AppState['popup'], value: boolean) => void
  setOption: <K extends keyof AppOption>(key: K, value: AppOption[K]) => void
}

const defaultOption: AppOption = {
  tab: 'style',
  tooltip: true,
  toolbar: true,
  autoAlign: true,
  i18n: 'en',
  splitX: 0.5,
  openaiApiKey: '',
  openaiApiUrl: '',
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      popup: {
        create: false,
        help: false,
        export: false,
        keyboard: false,
      },
      option: defaultOption,
      setPopup: (key, value) =>
        set(state => ({ popup: { ...state.popup, [key]: value } })),
      setOption: (key, value) =>
        set(state => ({ option: { ...state.option, [key]: value } })),
    }),
    {
      name: 'option',
      partialize: state => ({ option: state.option }),
      merge: (persisted, current) => ({
        ...current,
        option: { ...current.option, ...(persisted as { option?: Partial<AppOption> }).option },
      }),
    },
  ),
)
