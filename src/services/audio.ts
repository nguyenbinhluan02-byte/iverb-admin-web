import { supabase } from '@/lib/supabase'
import type { Voice } from './questions'

// Edge Function `admin-audio` (iverb-supabase TASK-035): audio files for
// listening questions, stored in the public `question-audio` bucket.

export type AudioErrorCode =
  | 'unauthorized'
  | 'not_admin'
  | 'invalid_audio'
  | 'too_large'
  | 'invalid_text'
  | 'not_configured'
  | 'tts_failed'
  | 'upload_failed'

const MESSAGES: Record<AudioErrorCode, string> = {
  unauthorized: 'Your session has expired. Sign in again.',
  not_admin: 'Only admins can add audio.',
  invalid_audio: 'Choose an MP3, M4A or WAV file.',
  too_large: 'The audio file must be 5 MB or smaller.',
  invalid_text: 'The transcript is empty or too long.',
  not_configured: 'Text-to-speech is not set up yet (GOOGLE_TTS_API_KEY).',
  tts_failed: 'Could not generate the audio. Try again.',
  upload_failed: 'Could not save the audio file. Try again.',
}

export class AudioError extends Error {
  code: string
  constructor(code: string) {
    super(MESSAGES[code as AudioErrorCode] ?? code)
    this.code = code
  }
}

/** Reads `{ error: code }` from a non-2xx Edge Function response. */
async function errorCode(error: unknown): Promise<string> {
  const response = (error as { context?: unknown })?.context
  if (response instanceof Response) {
    try {
      const body = (await response.clone().json()) as { error?: unknown }
      if (typeof body?.error === 'string') return body.error
    } catch {
      // not JSON
    }
  }
  return error instanceof Error ? error.message : String(error)
}

export const MAX_AUDIO_BYTES = 5 * 1024 * 1024
export const MAX_AUDIO_SECONDS = 30

/** Text-to-speech (Google Cloud TTS). Same text + voice → same file. */
export async function generateSpeech(text: string, voice: Voice) {
  const { data, error } = await supabase.functions.invoke('admin-audio', {
    body: { text, voice },
  })
  if (error) throw new AudioError(await errorCode(error))
  return data as { audio_url: string; duration_sec: number | null }
}

export async function uploadAudio(file: File) {
  const body = new FormData()
  body.append('file', file)
  const { data, error } = await supabase.functions.invoke('admin-audio', { body })
  if (error) throw new AudioError(await errorCode(error))
  return data as { audio_url: string; file_name: string; file_size: number }
}

/** Duration of a local or remote audio file, read by the browser. */
export function audioDuration(src: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => resolve(audio.duration)
    audio.onerror = () => reject(new AudioError('invalid_audio'))
    audio.src = src
  })
}

/** "1.2 MB" / "640 KB" */
export function fileSizeLabel(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}
