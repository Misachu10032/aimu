export const OPTION = {
  MIN_SUB_TIME: 0.2,
  MAX_SUB_WORD: 200,
  FFMPEG_TIMEOUT: 60000, // 1 minute
  WHISPER_TIMEOUT: 300000, // 5 minutes
  MAX_AUDIO_DECODE: 256 * 1024 * 1024, // 256 MB
  MAX_STT_DURATION: 60 * 10, // 10 minutes
  PRESETS: ['medium', 'fast', 'faster', 'veryfast', 'superfast'],
  RESOLUTIONS: ['0', '360', '480', '720', '1080', '1440'],
  SUBTITLE: ['vtt', 'srt', 'ass', 'json'],
  VIDEO: ['mp4', 'webm', 'flv', 'avi', 'mov', 'mkv', 'mp3', 'wav', 'aac'],
}
