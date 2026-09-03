import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadAudio } from '../lib/api'
import { useSessionStore } from '../store/session'
import GlassPanel from '../components/ui/GlassPanel'

type TabType = 'upload' | 'record'
type LangOption = { code: string; label: string; labelMr: string; enabled: boolean }

const LANGUAGES: LangOption[] = [
  { code: 'mr', label: 'Marathi', labelMr: 'मराठी', enabled: true },
  { code: 'hi', label: 'Hindi', labelMr: 'हिंदी', enabled: false },
  { code: 'en', label: 'English', labelMr: 'English', enabled: false },
]

export default function Input() {
  const navigate = useNavigate()
  const { startSession } = useSessionStore()

  const [tab, setTab] = useState<TabType>('upload')
  const [lang, setLang] = useState('mr')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioName, setAudioName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('audio/') && file.type !== 'video/webm') {
      setError('Please upload an audio file (WAV, MP3, OGG, WEBM).')
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File too large. Maximum size is 25 MB.')
      return
    }
    setError(null)
    setAudioBlob(file)
    setAudioName(file.name)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioName('mic-recording.webm')
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mediaRecorderRef.current = mr
      setIsRecording(true)
      setError(null)
    } catch {
      setError('Microphone access denied. Please allow microphone permission.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleSubmit = async () => {
    if (!audioBlob) return
    setIsUploading(true)
    setError(null)
    try {
      const { session_id, duration_sec } = await uploadAudio(audioBlob, audioName)
      startSession(session_id, audioName, duration_sec)
      navigate(`/analysis/${session_id}`)
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? 'Upload failed. Is the backend running?')
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-8 scanline-bg">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            <span className="font-marathi">आवाज तपासा</span>{' '}
            <span className="text-text-secondary font-normal text-lg">/ Analyze Voice</span>
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Upload a WAV/MP3 file or record directly from your microphone.
          </p>
        </div>

        {/* Language selector */}
        <GlassPanel className="p-4">
          <p className="text-text-secondary text-xs font-data tracking-widest mb-3">LANGUAGE / भाषा</p>
          <div className="flex gap-3">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                disabled={!l.enabled}
                onClick={() => l.enabled && setLang(l.code)}
                className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                  !l.enabled
                    ? 'border-border text-border cursor-not-allowed opacity-40'
                    : lang === l.code
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-border text-text-secondary hover:border-accent/40'
                }`}
              >
                <span className="font-marathi">{l.labelMr}</span>
                {!l.enabled && <span className="block text-[10px] font-data mt-0.5">COMING SOON</span>}
              </button>
            ))}
          </div>
        </GlassPanel>

        {/* Input tabs */}
        <GlassPanel>
          {/* Tab header */}
          <div className="flex gap-1 mb-6 bg-canvas rounded-xl p-1">
            {(['upload', 'record'] as TabType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setAudioBlob(null); setError(null) }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  tab === t
                    ? 'bg-accent text-canvas'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t === 'upload' ? '📁 Upload File' : '🎙 Record Mic'}
              </button>
            ))}
          </div>

          {/* Upload tab */}
          {tab === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40 hover:bg-surface'
              }`}
            >
              {audioBlob ? (
                <div className="space-y-2">
                  <p className="text-4xl">✅</p>
                  <p className="text-text-primary font-medium">{audioName}</p>
                  <p className="text-text-secondary text-xs">
                    {(audioBlob.size / 1024).toFixed(1)} KB · Click to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-4xl">🎵</p>
                  <p className="text-text-primary">
                    <span className="font-marathi">येथे फाइल टाका</span> / Drop file here or click
                  </p>
                  <p className="text-text-secondary text-xs font-data">WAV · MP3 · OGG · WEBM · max 25 MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.webm"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          )}

          {/* Record tab */}
          {tab === 'record' && (
            <div className="flex flex-col items-center gap-4 py-6">
              {isRecording && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-risk-high animate-ping" />
                  <span className="text-risk-high text-sm font-data">RECORDING...</span>
                </div>
              )}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl transition-all ${
                  isRecording
                    ? 'border-risk-high bg-risk-high/10 glow-high'
                    : 'border-accent bg-accent/10 glow-accent hover:scale-105'
                }`}
              >
                {isRecording ? '⏹' : '🎙'}
              </button>
              <p className="text-text-secondary text-sm">
                {isRecording ? 'Click to stop recording' : 'Click to start recording'}
              </p>
              {audioBlob && !isRecording && (
                <p className="text-risk-low text-sm">✓ Recording ready — {(audioBlob.size / 1024).toFixed(1)} KB</p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl border border-risk-high/30 bg-risk-high/5 text-risk-high text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          {audioBlob && (
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="mt-6 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-base py-4"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <>🔍 <span className="font-marathi">विश्लेषण सुरू करा</span> / Start Analysis</>
              )}
            </button>
          )}
        </GlassPanel>
      </div>
    </div>
  )
}
