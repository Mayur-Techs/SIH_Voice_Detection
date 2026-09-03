import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RiskState, Stage, WsRiskUpdateEvent, ReportData } from '../types/api'

export interface HistoryEntry {
  session_id: string
  filename: string
  timestamp: string
  final_state: RiskState
  final_score: number
}

interface SessionState {
  // Live session
  sessionId: string | null
  filename: string | null
  durationSec: number
  currentStage: Stage
  completedStages: Stage[]
  currentRiskScore: number   // 0-1
  currentRiskState: RiskState
  riskUpdates: WsRiskUpdateEvent[]
  report: ReportData | null
  error: string | null

  // History (persisted)
  history: HistoryEntry[]

  // Actions
  startSession: (id: string, filename: string, duration: number) => void
  setStage: (stage: Stage) => void
  pushRiskUpdate: (update: WsRiskUpdateEvent) => void
  setReport: (report: ReportData) => void
  setError: (msg: string) => void
  addHistory: (entry: HistoryEntry) => void
  clearHistory: () => void
  reset: () => void
}

const INITIAL = {
  sessionId: null as string | null,
  filename: null as string | null,
  durationSec: 0,
  currentStage: 'idle' as Stage,
  completedStages: [] as Stage[],
  currentRiskScore: 0,
  currentRiskState: 'LOW_RISK' as RiskState,
  riskUpdates: [] as WsRiskUpdateEvent[],
  report: null as ReportData | null,
  error: null as string | null,
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...INITIAL,
      history: [] as HistoryEntry[],
      startSession: (id, filename, duration) =>
        set({
          sessionId: id,
          filename,
          durationSec: duration,
          currentStage: 'idle',
          completedStages: [],
          currentRiskScore: 0,
          currentRiskState: 'LOW_RISK',
          riskUpdates: [],
          report: null,
          error: null,
        }),

      setStage: (stage) =>
        set((s) => ({
          currentStage: stage,
          completedStages: stage !== 'error'
            ? [...s.completedStages.filter(x => x !== stage), stage]
            : s.completedStages,
        })),

      pushRiskUpdate: (update) =>
        set((s) => ({
          riskUpdates: [...s.riskUpdates, update],
          currentRiskScore: update.risk_score,
          currentRiskState: update.state,
        })),

      setReport: (report) => set({ report }),

      setError: (msg) => set({ error: msg, currentStage: 'error' }),

      addHistory: (entry) =>
        set((s) => ({ history: [entry, ...s.history].slice(0, 50) })),

      clearHistory: () => set({ history: [] }),

      reset: () =>
        set({
          sessionId: null,
          filename: null,
          durationSec: 0,
          currentStage: 'idle',
          completedStages: [],
          currentRiskScore: 0,
          currentRiskState: 'LOW_RISK',
          riskUpdates: [],
          report: null,
          error: null,
        }),
    }),
    {
      name: 'shrav-v2',
      partialize: (s) => ({ history: s.history }),
    }
  )
)
