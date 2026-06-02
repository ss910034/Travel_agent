import { parseISO, isAfter, isBefore } from 'date-fns'
import type { Activity, ActivityStatus, TripDay } from '@/types'

export function computeActivityStatus(activity: Activity, now: Date = new Date()): ActivityStatus {
  if (activity.status === 'completed' || activity.status === 'skipped') {
    return activity.status
  }
  const start = parseISO(activity.startTime)
  const end = parseISO(activity.endTime)
  if (isBefore(now, start)) return 'pending'
  if (isAfter(now, end)) return 'pending'
  return 'in-progress'
}

export function findCurrentActivity(activities: Activity[]): Activity | null {
  const now = new Date()
  return activities.find(a => {
    if (a.status === 'completed' || a.status === 'skipped') return false
    const start = parseISO(a.startTime)
    const end = parseISO(a.endTime)
    return !isBefore(now, start) && !isAfter(now, end)
  }) ?? null
}

export function findNextPendingActivity(activities: Activity[], afterId?: string): Activity | null {
  const eligible = activities.filter(a => a.status !== 'completed' && a.status !== 'skipped')
  if (!afterId) {
    const now = new Date()
    return eligible.find(a => isAfter(parseISO(a.startTime), now)) ?? null
  }
  const idx = eligible.findIndex(a => a.id === afterId)
  return idx >= 0 ? eligible[idx + 1] ?? null : null
}

export function getTodayActivities(days: TripDay[]): Activity[] {
  const today = new Date().toISOString().split('T')[0]
  return days.find(d => d.date === today)?.activities ?? []
}
