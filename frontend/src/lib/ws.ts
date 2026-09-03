import type { WsEvent } from '../types/api'
import { useSessionStore } from '../store/session'

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000'
const WS_BASE = BASE.replace(/^https/, 'wss').replace(/^http/, 'ws')

export function connectStream(
  sessionId: string,
  onComplete?: () => void
): WebSocket {
  const store = useSessionStore.getState()
  const ws = new WebSocket(`${WS_BASE}/session/${sessionId}/stream`)

  ws.onopen = () => console.log(`[WS] Session ${sessionId.slice(0, 8)} connected`)

  ws.onmessage = (evt) => {
    let msg: WsEvent
    try {
      msg = JSON.parse(evt.data as string) as WsEvent
    } catch {
      return
    }

    if (msg.type === 'stage') {
      store.setStage(msg.stage)
      if (msg.stage === 'complete') {
        onComplete?.()
      }
    } else if (msg.type === 'risk_update') {
      store.pushRiskUpdate(msg)
    } else if (msg.type === 'error') {
      store.setError(msg.message)
    }
  }

  ws.onerror = () => store.setError('WebSocket connection failed.')

  ws.onclose = () => console.log(`[WS] Session ${sessionId.slice(0, 8)} closed`)

  return ws
}
