'use client'

import { useState } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import type { Activity } from '@/types'
import { CATEGORY_ICONS } from '@/types'
import { formatTime } from '@/lib/utils/dateUtils'
import { TransportBadge } from './TransportBadge'
import { cn } from '@/lib/utils/cn'

interface ActivityCardProps {
  activity: Activity
  onEdit?: () => void
  onDelete?: () => void
  showStatus?: boolean
}

const statusBorder = {
  pending: 'border-l-gray-200',
  'in-progress': 'border-l-green-400',
  completed: 'border-l-gray-300',
  skipped: 'border-l-gray-200',
}

export function ActivityCard({ activity, onEdit, onDelete, showStatus }: ActivityCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm p-4 border-l-4', statusBorder[activity.status])}>
        <div className="flex items-start justify-between">
          <div className="flex gap-3 flex-1 min-w-0">
            <span className="text-2xl shrink-0 mt-0.5">{CATEGORY_ICONS[activity.category]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{activity.name}</span>
                {showStatus && activity.status === 'in-progress' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">進行中</span>
                )}
                {showStatus && activity.status === 'completed' && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">已完成</span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{activity.location.name}</div>
              <div className="text-sm text-gray-600 mt-1 font-medium">
                {formatTime(activity.startTime)} – {formatTime(activity.endTime)}
              </div>
              {activity.notes && (
                <div className="text-sm text-gray-400 mt-1">{activity.notes}</div>
              )}
            </div>
          </div>

          {(onEdit || onDelete) && (
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[120px]">
                    {onEdit && (
                      <button
                        onClick={() => { onEdit(); setMenuOpen(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit2 size={14} /> 編輯
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => { onDelete(); setMenuOpen(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} /> 刪除
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {activity.transportToNext && (
        <div className="ml-8">
          <TransportBadge transport={activity.transportToNext} />
        </div>
      )}
    </div>
  )
}
