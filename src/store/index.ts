import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Investigation, ThreatIntelSource, ChatMessage } from '@/types'
import { mockInvestigations, mockThreatIntelSources } from '@/lib/mockData'
import { generateId } from '@/lib/utils'

interface AppState {
  // Investigations
  investigations: Investigation[]
  addInvestigation: (inv: Investigation) => void
  updateInvestigation: (id: string, updates: Partial<Investigation>) => void
  removeInvestigation: (id: string) => void
  getInvestigation: (id: string) => Investigation | undefined

  // Threat Intel Sources
  threatIntelSources: ThreatIntelSource[]
  updateThreatIntelSource: (name: string, updates: Partial<ThreatIntelSource>) => void

  // Chat messages per investigation
  chatMessages: Record<string, ChatMessage[]>
  addChatMessage: (investigationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearChatMessages: (investigationId: string) => void

  // Global search
  searchQuery: string
  setSearchQuery: (q: string) => void

  // UI state
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ─── Investigations ─────────────────────────────────────────────────────
      investigations: mockInvestigations,

      addInvestigation: (inv) =>
        set((state) => ({ investigations: [inv, ...state.investigations] })),

      updateInvestigation: (id, updates) =>
        set((state) => ({
          investigations: state.investigations.map((inv) =>
            inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv
          ),
        })),

      removeInvestigation: (id) =>
        set((state) => ({
          investigations: state.investigations.filter((inv) => inv.id !== id),
        })),

      getInvestigation: (id) => get().investigations.find((inv) => inv.id === id),

      // ─── Threat Intel Sources ───────────────────────────────────────────────
      threatIntelSources: mockThreatIntelSources,

      updateThreatIntelSource: (name, updates) =>
        set((state) => ({
          threatIntelSources: state.threatIntelSources.map((src) =>
            src.name === name ? { ...src, ...updates } : src
          ),
        })),

      // ─── Chat ───────────────────────────────────────────────────────────────
      chatMessages: {},

      addChatMessage: (investigationId, message) =>
        set((state) => {
          const existing = state.chatMessages[investigationId] || []
          const newMsg: ChatMessage = {
            ...message,
            id: generateId(),
            timestamp: new Date().toISOString(),
          }
          return {
            chatMessages: {
              ...state.chatMessages,
              [investigationId]: [...existing, newMsg],
            },
          }
        }),

      clearChatMessages: (investigationId) =>
        set((state) => ({
          chatMessages: { ...state.chatMessages, [investigationId]: [] },
        })),

      // ─── Search ─────────────────────────────────────────────────────────────
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      // ─── UI ─────────────────────────────────────────────────────────────────
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'cyberthreat-os-store',
      partialize: (state) => ({
        investigations: state.investigations,
        threatIntelSources: state.threatIntelSources,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
