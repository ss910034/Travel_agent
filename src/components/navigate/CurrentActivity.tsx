'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import type { Activity } from '@/types'
import { CATEGORY_ICONS } from '@/types'
import { formatTime, formatRemainingTime } from '@/lib/utils/dateUtils'

export function CurrentActivity({ activity }: { activity: Activity }) {
  const [remaining, setRemaining] = useState(formatRemainingTime(activity.endTime))

  useEffect(() => {
    const interval = setInterval(() => setRemaining(formatRemainingTime(activity.endTime)), 10000)
    return () => clearInterval(interval)
  }, [activity.endTime])

  return (
    <div className="flex-1 flex flex-col justify-center px-5 py-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm font-medium text-green-600">目前進行中</span>
      </div>

      <div className="text-6xl mb-4">{CATEGORY_ICONS[activity.category]}</div>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">{activity.name}</h2>

      <div className="flex items-center gap-1.5 text-gray-500 mb-3">
        <MapPin size={16} />
        <span className="text-base">{activity.location.name}</span>
      </div>

      <div className="text-base text-gray-600 mb-4">
        {formatTime(activity.startTime)} – {formatTime(activity.endTime)}
      </div>

      <div className="bg-green-50 rounded-2xl px-4 py-3 inline-block">
        <span className="text-green-700 font-semibold text-lg">{remaining}</span>
      </div>

      {activity.notes && (
        <div className="mt-4 bg-amber-50 rounded-xl px-4 py-3 text-sm text-amber-800">
          📝 {activity.notes}
        </div>
      )}
    </div>
  )
}
