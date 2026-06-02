'use client'

import { create } from 'zustand'
import type { Activity } from '@/types'

interface NavigateStore {
  currentActivity: Activity | null
  nextActivity: Activity | null
  setCurrentActivity: (a: Activity | null) => void
  setNextActivity: (a: Activity | null) => void
}

export const useNavigateStore = create<NavigateStore>((set) => ({
  currentActivity: null,
  nextActivity: null,
  setCurrentActivity: (a) => set({ currentActivity: a }),
  setNextActivity: (a) => set({ nextActivity: a }),
}))
