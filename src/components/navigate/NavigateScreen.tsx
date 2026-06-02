'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, SkipForward, CheckCircle, List } from 'lucide-react'
import type { Trip } from '@/types'
import { useTripStore } from '@/stores/tripStore'
import { useActivityStatus } from '@/hooks/useActivityStatus'
import { CurrentActivity } from './CurrentActivity'
import { NextActivityPreview } from './NextActivityPreview'
import { getTodayActivities } from '@/lib/navigate/activityStatus'

interface NavigateScreenProps {
  trip: Trip
}

export function NavigateScreen({ trip }: NavigateScreenProps) {
  const router = useRouter()
  const { updateActivity } = useTripStore()
  const todayActivities = getTodayActivities(trip.days)
  const { current, next } = useActivityStatus(todayActivities)

  const today = new Date().toISOString().split('T')[0]
  const todayIndex = trip.days.findIndex(d => d.date === today)
  const dayLabel = todayIndex >= 0 ? `第 ${todayIndex + 1} 天 / ${trip.days.length} 天` : ''

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(wl => { wakeLock = wl }).catch(() => {})
    }
    return () => { wakeLock?.release() }
  }, [])

  const handleComplete = useCallback(async () => {
    if (!current) return
    await updateActivity(trip.id, today, current.id, { status: 'completed' })
  }, [current, trip.id, today, updateActivity])

  const handleSkip = useCallback(async () => {
    if (!current) return
    await updateActivity(trip.id, today, current.id, { status: 'skipped' })
  }, [current, trip.id, today, updateActivity])

  const allDone = todayActivities.every(a => a.status === 'completed' || a.status === 'skipped')
  const noneStarted = todayActivities.length === 0

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top py-3 text-white">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-400">
          <ChevronLeft size={20} />
          <span className="text-sm">返回</span>
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold">{trip.title}</div>
          {dayLabel && <div className="text-xs text-gray-400">{dayLabel}</div>}
        </div>
        <button
          onClick={() => router.push(`/trips/${trip.id}/day/${today}`)}
          className="text-gray-400 p-1"
        >
          <List size={20} />
        </button>
      </div>

      {/* Main content */}
      {noneStarted && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-white mb-2">今天沒有安排活動</h2>
          <p className="text-gray-400 text-sm">前往行程頁面新增活動</p>
        </div>
      )}

      {!noneStarted && allDone && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-white mb-2">今日行程完成！</h2>
          <p className="text-gray-400 text-sm">辛苦了，好好休息吧</p>
        </div>
      )}

      {!noneStarted && !allDone && !current && next && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="text-xl font-bold text-white mb-2">等待下一個活動</h2>
          <p className="text-gray-400 text-sm mb-4">
            {next.name} 將於 {next.startTime.split('T')[1]?.slice(0, 5)} 開始
          </p>
        </div>
      )}

      {current && (
        <div className="flex-1 flex flex-col overflow-hidden text-white">
          <CurrentActivity activity={current} />
        </div>
      )}

      {/* Next activity */}
      {current && next && (
        <NextActivityPreview current={current} next={next} />
      )}

      {/* Action bar */}
      {current && (
        <div className="flex items-center gap-3 px-4 py-4 pb-safe-bottom">
          <button
            onClick={handleSkip}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-gray-200 rounded-2xl py-3 text-sm font-medium"
          >
            <SkipForward size={16} />
            跳過
          </button>
          <button
            onClick={() => router.push(`/trips/${trip.id}/day/${today}`)}
            className="bg-gray-700 text-gray-200 rounded-2xl p-3"
          >
            <List size={20} />
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white rounded-2xl py-3 text-sm font-medium"
          >
            <CheckCircle size={16} />
            完成
          </button>
        </div>
      )}
    </div>
  )
}
