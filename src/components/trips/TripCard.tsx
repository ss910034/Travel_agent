'use client'

import Link from 'next/link'
import { MapPin, Calendar, ChevronRight, Play } from 'lucide-react'
import type { Trip } from '@/types'
import { formatShortDate, getTripDuration } from '@/lib/utils/dateUtils'
import { cn } from '@/lib/utils/cn'

const STATUS_CONFIG = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  upcoming: { label: '即將出發', color: 'bg-blue-100 text-blue-700' },
  active: { label: '進行中', color: 'bg-green-100 text-green-700' },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-500' },
}

interface TripCardProps {
  trip: Trip
  onDelete?: (id: string) => void
}

export function TripCard({ trip }: TripCardProps) {
  const duration = getTripDuration(trip.startDate, trip.endDate)
  const config = STATUS_CONFIG[trip.status]
  const totalActivities = trip.days.reduce((sum, d) => sum + d.activities.length, 0)

  return (
    <Link href={`/trips/${trip.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 active:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-base">{trip.title}</h3>
            <div className="flex items-center gap-1 mt-0.5 text-sm text-gray-500">
              <MapPin size={14} />
              <span>{trip.destination}</span>
            </div>
          </div>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2', config.color)}>
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatShortDate(trip.startDate)} – {formatShortDate(trip.endDate)}</span>
          </div>
          <span className="text-gray-300">·</span>
          <span>{duration} 天</span>
          <span className="text-gray-300">·</span>
          <span>{totalActivities} 個活動</span>
        </div>

        <div className="flex items-center justify-between">
          {trip.status === 'active' && (
            <Link
              href={`/trips/${trip.id}/navigate`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg"
            >
              <Play size={14} fill="currentColor" />
              開始導航
            </Link>
          )}
          <div className="ml-auto flex items-center gap-1 text-gray-400">
            <span className="text-sm">查看行程</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  )
}
