import { ImagePlus, Loader2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { uploadLessonMedia } from '@/services/lessons'

// Drop or click to add an image (cover / word image) → lesson-media bucket.

export function ImageDrop({
  url,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  url: string | null
  onChange: (url: string | null) => void
  placeholder: string
  disabled?: boolean
  className: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)

  const upload = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Choose a JPG, PNG or WebP image.')
      return
    }
    setBusy(true)
    try {
      onChange((await uploadLessonMedia(file)).url)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[10px] ${className} ${
        url ? '' : `border-[1.5px] border-dashed ${over ? 'border-brand bg-brand-tint' : 'border-line-strong bg-page'}`
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        if (!disabled) upload(e.dataTransfer.files[0])
      }}
    >
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          upload(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {url ? (
        <>
          <img src={url} alt="" className="size-full object-cover" />
          {!disabled && (
            <button
              type="button"
              title="Remove image"
              aria-label="Remove image"
              onClick={() => onChange(null)}
              className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/55 text-white"
            >
              <X size={14} strokeWidth={2.6} />
            </button>
          )}
        </>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
          className="flex size-full flex-col items-center justify-center gap-1.5 text-[13px] font-bold text-muted disabled:cursor-not-allowed"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          {busy ? 'Uploading…' : placeholder}
        </button>
      )}
    </div>
  )
}
