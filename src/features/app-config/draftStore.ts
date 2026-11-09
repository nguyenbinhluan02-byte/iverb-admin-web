import { useSyncExternalStore } from 'react'
import type { AppConfig, AppConfigKey } from '@/services/appConfig'

// Unsaved App config edits. Module-level so the draft survives leaving the
// page and the sidebar can show its dot (design: orange dot = unsaved changes).
// Only keys that differ from the saved value are kept.

export type Draft = Partial<AppConfig>

let draft: Draft = {}
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const appConfigDraft = {
  get: () => draft,
  set<K extends AppConfigKey>(key: K, value: AppConfig[K], saved: AppConfig | undefined) {
    const next = { ...draft }
    if (saved && saved[key] === value) delete next[key]
    else next[key] = value
    draft = next
    emit()
  },
  clear() {
    draft = {}
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

export const useAppConfigDraft = () =>
  useSyncExternalStore(appConfigDraft.subscribe, appConfigDraft.get)

export const useAppConfigDirty = () => Object.keys(useAppConfigDraft()).length > 0
