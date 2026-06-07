export interface SubtitleStyle {
  Name: string
  Fontname: string
  Fontsize: number
  PrimaryColour: string
  SecondaryColour: string
  OutlineColour: string
  SecondaryOutlineColour: string
  BackColour: string
  SecondaryBackColour?: string
  Bold: number
  Italic: number
  Underline: number
  StrikeOut: number
  ScaleX: number
  ScaleY: number
  Spacing: number
  Angle: number
  BorderStyle: number
  Outline: number
  Shadow: number
  Alignment: number
  MarginL: number
  MarginR: number
  MarginV: number
  Encoding: number
}

export interface TaskOption {
  name: string
  videoType: number
  subtitleType: number
  subtitleMode: number
  burnPreset: string
  burnSize: number
  translateTo: string
  transcribeTo: string
  useWhisperWasm: boolean
}

export interface TaskOffline {
  canPlay: boolean
  subtitleFile: File | null
  audioFile: File | null
  audioBlobUrl: string | null
  videoFile: File | null
  videoBlobUrl: string
  videoPoster: string
  videoDuration: number
  videoHasAudio: boolean
  videoHasVideo: boolean
  thumbnail: {
    url: string
    height: number
    width: number
    number: number
    column: number
  }
}

export interface RawSub {
  _id?: string
  start?: string
  end?: string
  text?: string
  text2?: string
  startTime?: number | null
  endTime?: number | null
}

export interface TaskData {
  id?: string
  subtitle: RawSub[]
  option: TaskOption
  style: SubtitleStyle
  offline: TaskOffline
}

export const EXTEND: TaskData = {
  subtitle: [],
  option: {
    name: '',
    videoType: 1,
    subtitleType: 1,
    subtitleMode: 1,
    burnPreset: 'fast',
    burnSize: 0,
    translateTo: '',
    transcribeTo: 'en',
    useWhisperWasm: false,
  },
  style: {
    Name: 'Default',
    Fontname: 'Source Han Sans CN Normal',
    Fontsize: 20,
    PrimaryColour: '&H00FFFFFF',
    SecondaryColour: '&H00FFFFFF',
    OutlineColour: '&H00000000',
    SecondaryOutlineColour: '&H00000000',
    BackColour: '&H00000000',
    Bold: 0,
    Italic: 0,
    Underline: 0,
    StrikeOut: 0,
    ScaleX: 100,
    ScaleY: 100,
    Spacing: 0,
    Angle: 0,
    BorderStyle: 1,
    Outline: 1,
    Shadow: 1,
    Alignment: 2,
    MarginL: 10,
    MarginR: 10,
    MarginV: 10,
    Encoding: 134,
  },
  offline: {
    canPlay: false,
    subtitleFile: null,
    audioFile: null,
    audioBlobUrl: null,
    videoFile: null,
    videoBlobUrl: '',
    videoPoster: '',
    videoDuration: 0,
    videoHasAudio: true,
    videoHasVideo: true,
    thumbnail: {
      url: '',
      height: 0,
      width: 0,
      number: 0,
      column: 0,
    },
  },
}
