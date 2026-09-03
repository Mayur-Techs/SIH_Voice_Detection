export type RiskState = 'LOW_RISK' | 'SUSPICIOUS' | 'HIGH_RISK'
export type Stage =
  | 'idle'
  | 'uploading'
  | 'preprocessing'
  | 'representation'
  | 'anti_spoof_model'
  | 'complete'
  | 'error'

export interface UploadResponse {
  session_id: string
  duration_sec: number
}

export interface WsStageEvent {
  type: 'stage'
  stage: Exclude<Stage, 'idle' | 'uploading' | 'error'>
}

export interface WsRiskUpdateEvent {
  type: 'risk_update'
  window_index: number
  risk_score: number  // 0-1
  state: RiskState
}

export interface WsErrorEvent {
  type: 'error'
  message: string
}

export type WsEvent = WsStageEvent | WsRiskUpdateEvent | WsErrorEvent

export interface TimelinePoint {
  t: number
  score: number  // 0-1
}

export interface ReportData {
  final_state: RiskState
  final_score: number   // 0-1
  confidence: number    // 0-1
  timeline: TimelinePoint[]
  model_used: string
  recommendation: string
}
