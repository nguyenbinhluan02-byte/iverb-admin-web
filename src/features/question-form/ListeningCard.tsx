import { Headphones, Music, Pause, Play } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { UseFormRegister } from 'react-hook-form'
import { toast } from 'sonner'
import {
  audioDuration,
  fileSizeLabel,
  generateSpeech,
  MAX_AUDIO_BYTES,
  MAX_AUDIO_SECONDS,
} from '@/services/audio'
import { errorMessage } from '@/lib/errors'
import {
  BLANK,
  hasListening,
  ttsKey,
  ttsUpToDate,
  VOICES,
  words,
  type FormValues,
} from './formModel'

const field =
  'w-full rounded-[11px] border border-line-strong bg-card px-3.5 py-3 text-[15px] text-ink disabled:bg-page disabled:text-muted'
const label = 'text-[13px] font-extrabold'
const labelNote = 'font-semibold text-muted'

const voiceLabel = (v: FormValues['voice']) => VOICES.find((x) => x.value === v)?.label ?? v

interface Props {
  values: FormValues
  register: UseFormRegister<FormValues>
  set: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
  locked: boolean
  /** voice|transcript the current TTS audioUrl was made for */
  generatedFor: string | null
  onGenerated: (key: string) => void
}

// Design (Oct 31 · Listening): card under the "Question" field.
export function ListeningCard({ values, register, set, locked, generatedFor, onGenerated }: Props) {
  const on = hasListening(values)
  const order = values.type === 'order'
  const dictation = values.type === 'dictation'
  const tts = values.audioSource === 'tts'
  const transcriptWords = words(values.transcript).length

  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  // Local URL of the picked file (revoked when it changes).
  const pickedUrl = useMemo(
    () => (values.picked ? URL.createObjectURL(values.picked.file) : null),
    [values.picked],
  )
  useEffect(() => () => void (pickedUrl && URL.revokeObjectURL(pickedUrl)), [pickedUrl])

  const stop = () => {
    audio.current?.pause()
    audio.current = null
    setPlaying(false)
  }
  useEffect(() => stop, [])

  const play = (src: string) => {
    stop()
    const a = new Audio(src)
    a.onended = () => setPlaying(false)
    audio.current = a
    setPlaying(true)
    a.play().catch(() => setPlaying(false))
  }

  const fileSrc = pickedUrl ?? (values.audioMeta?.source === 'file' ? values.audioUrl : '')
  const cannotPlay = busy || (tts ? !values.transcript.trim() : !fileSrc)

  const onPlay = async () => {
    if (playing) return stop()
    if (!tts) return play(fileSrc)
    if (ttsUpToDate(values, generatedFor)) return play(values.audioUrl)
    // Generate now (same file as on save, so saving does not call TTS again).
    setBusy(true)
    try {
      const r = await generateSpeech(values.transcript.trim(), values.voice)
      set('audioUrl', r.audio_url)
      set('audioMeta', { source: 'tts', voice: values.voice, duration_sec: r.duration_sec })
      onGenerated(ttsKey(values.voice, values.transcript))
      play(r.audio_url)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_AUDIO_BYTES) return toast.error('The audio file must be 5 MB or smaller.')
    const url = URL.createObjectURL(file)
    try {
      const seconds = await audioDuration(url)
      if (seconds > MAX_AUDIO_SECONDS)
        return toast.error('The audio must be 30 seconds or shorter.')
      stop()
      set('picked', { file, durationSec: Math.round(seconds * 10) / 10 })
    } catch {
      toast.error('Choose an MP3, M4A or WAV file.')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const fileName =
    values.picked?.file.name ??
    (values.audioMeta?.source === 'file' ? values.audioMeta.file_name : undefined)
  const fileSize =
    values.picked?.file.size ??
    (values.audioMeta?.source === 'file' ? values.audioMeta.file_size : undefined)

  const seconds =
    ttsUpToDate(values, generatedFor) && values.audioMeta?.duration_sec
      ? Math.round(values.audioMeta.duration_sec)
      : Math.max(2, Math.round(transcriptWords * 0.4))
  const meta = tts
    ? transcriptWords
      ? `~${seconds} s · ${voiceLabel(values.voice)}${dictation ? ` · ${transcriptWords} words` : ''}`
      : 'Type the transcript to generate audio'
    : (fileName ?? 'No file chosen yet')

  const fillGuess =
    values.type === 'fill' && values.sentence.trim()
      ? values.sentence.replace(BLANK, values.answer.split('/')[0].trim() || BLANK)
      : ''

  return (
    <div
      className={`flex flex-col gap-4 rounded-[14px] border-[1.5px] p-4 ${
        on ? 'border-[#FBDCC6] bg-[#FFF8F2]' : 'border-line bg-card'
      } ${order ? 'opacity-55' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex size-[30px] shrink-0 items-center justify-center rounded-lg ${
            on ? 'bg-brand text-white' : 'bg-page text-ink'
          }`}
        >
          <Headphones size={16} strokeWidth={2.4} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-extrabold">Listening</span>
          <span className="text-xs text-muted">
            {order
              ? 'Not available for Reorder words'
              : dictation
                ? 'Users listen, then type the whole sentence'
                : on
                  ? 'Users hear the audio before answering'
                  : 'Turn on to add audio to this question'}
          </span>
        </span>
        {dictation ? (
          <span className="rounded-full bg-[rgba(242,113,28,.12)] px-[9px] py-[3px] text-[11px] font-extrabold whitespace-nowrap text-brand-deep">
            Always on
          </span>
        ) : (
          !order && (
            <button
              type="button"
              role="switch"
              aria-checked={on}
              title="Listening question"
              disabled={locked}
              onClick={() => {
                stop()
                set('listening', !values.listening)
              }}
              className={`flex h-[26px] w-11 shrink-0 rounded-full p-[3px] transition-colors disabled:cursor-not-allowed ${
                on ? 'justify-end bg-brand' : 'justify-start bg-[#D4D4D8]'
              }`}
            >
              <span className="size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.25)]" />
            </button>
          )
        )}
      </div>

      {on && (
        <div className="flex flex-col gap-4 border-t border-[#FBDCC6] pt-3.5">
          <div className="flex flex-col gap-2">
            <span className={label}>Audio source</span>
            <div className="inline-flex gap-0.5 self-start rounded-[10px] bg-page p-[3px]">
              {(
                [
                  ['tts', 'Text-to-speech'],
                  ['file', 'Upload audio'],
                ] as const
              ).map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    stop()
                    set('audioSource', value)
                  }}
                  className={`rounded-lg px-3.5 py-[7px] text-[13px] font-bold whitespace-nowrap ${
                    values.audioSource === value
                      ? 'bg-card text-ink shadow-[0_1px_3px_rgba(0,0,0,.1)]'
                      : 'text-muted'
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {tts ? (
            <div className="flex flex-col gap-2">
              <span className={label}>Voice</span>
              <div className="flex flex-wrap gap-2">
                {VOICES.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    disabled={locked}
                    onClick={() => set('voice', v.value)}
                    className={`rounded-full border-[1.5px] px-3 py-2 text-[13px] font-bold whitespace-nowrap text-ink ${
                      values.voice === v.value
                        ? 'border-brand bg-[#FFF4EC]'
                        : 'border-line-strong bg-card'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] border-dashed bg-card p-3.5 ${
                fileName ? 'border-green' : 'border-[#D4D4D8]'
              }`}
            >
              <input
                type="file"
                accept="audio/*"
                disabled={locked}
                className="hidden"
                onChange={(e) => {
                  void onFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-page text-ink">
                <Music size={18} strokeWidth={2.2} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-bold">
                  {fileName ?? 'Choose an audio file'}
                </span>
                <span className="text-xs text-muted">
                  {fileName
                    ? `${fileSize ? fileSizeLabel(fileSize) : 'Saved file'} · tap to replace`
                    : 'MP3, M4A or WAV · up to 5 MB · max 30 s'}
                </span>
              </span>
              <span className="shrink-0 rounded-[9px] border border-line-strong px-3 py-2 text-[13px] font-bold whitespace-nowrap">
                {fileName ? 'Replace' : 'Browse'}
              </span>
            </label>
          )}

          <label className="flex flex-col gap-2">
            <span className={label}>
              {dictation ? 'Sentence users must write' : 'Transcript'}{' '}
              <span className={labelNote}>
                —{' '}
                {dictation
                  ? 'graded word by word, capitals and punctuation ignored'
                  : 'exactly what is said; shown after users answer'}
              </span>
            </span>
            <textarea
              rows={2}
              disabled={locked}
              placeholder={
                dictation
                  ? 'e.g. We went to the beach with our friends last weekend.'
                  : fillGuess ||
                    "e.g. Hi, it's Sarah. I'm running late because my train was cancelled."
              }
              className={`${field} resize-y leading-[1.45]`}
              {...register('transcript')}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPlay}
              disabled={cannotPlay}
              className="flex items-center gap-2 rounded-[10px] bg-ink px-3.5 py-[9px] text-[13px] font-extrabold whitespace-nowrap text-white disabled:bg-line-strong disabled:text-subtle"
            >
              {playing ? (
                <Pause size={14} fill="currentColor" strokeWidth={0} />
              ) : (
                <Play size={14} fill="currentColor" strokeWidth={0} />
              )}
              {busy ? 'Generating…' : playing ? 'Stop' : tts ? 'Play preview' : 'Play file'}
            </button>
            <span className="text-xs text-muted">{meta}</span>
          </div>
        </div>
      )}
    </div>
  )
}
