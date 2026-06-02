'use client'

import { useEffect, useState } from 'react'
import type { Activity } from '@/types'
import { findCurrentActivity, findNextPendingActivity } from '@/lib/navigate/activityStatus'

export function useActivityStatus(activities: Activity[]) {
  const [current, setCurrent] = useState<Activity | null>(null)
  const [next, setNext] = useState<Activity | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const c = findCurrentActivity(activities)
    setCurrent(c)
    setNext(findNextPendingActivity(activities, c?.id))
  }, [activities, tick])

  return { current, next }
}
