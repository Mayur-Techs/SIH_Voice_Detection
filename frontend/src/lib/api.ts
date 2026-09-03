import axios from 'axios'
import type { UploadResponse, ReportData } from '../types/api'

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000'

const api = axios.create({ baseURL: BASE, timeout: 120_000 })

export async function uploadAudio(
  file: Blob,
  filename: string
): Promise<UploadResponse> {
  const form = new FormData()
  form.append('audio', file, filename)
  const res = await api.post<UploadResponse>('/session/upload', form)
  return res.data
}

export async function fetchReport(sessionId: string): Promise<ReportData> {
  const res = await api.get<ReportData>(`/session/${sessionId}/report`)
  return res.data
}

export function reportPdfUrl(sessionId: string): string {
  return `${BASE}/session/${sessionId}/report.pdf`
}

export async function checkHealth(): Promise<{ status: string; model: string; model_loaded: boolean }> {
  const res = await api.get('/health')
  return res.data
}
