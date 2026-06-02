'use client'

import { ExternalLink } from 'lucide-react'
import type { Activity } from '@/types'
import { CATEGORY_ICONS, TRANSPORT_ICONS, TRANSPORT_LABELS } from '@/types'
import { formatTime, formatDuration } from '@/lib/utils/dateUtils'
import { getNavigationUrl } from '@/lib/navigate/navigationHelper'

interface NextActivityPreviewProps {
  current: Activity
  next: Activity
}

export function NextActivityPreview({ current, next }: NextActivityPreviewProps) {
  const transport = current.transportToNext

  const handleNavigate = () => {
    const url = getNavigationUrl(next.location)
    window.open(url, '_blank')
  }

  return (
    <div className="bg-gray-800 rounded-2xl px-4 py-4 mx-4 flex flex-col gap-2">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">下一站</div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{CATEGORY_ICONS[next.category]}</span>
          <div>
            <div className="font-semibold text-white">{next.name}</div>
            <div className="text-sm text-gray-400">{next.location.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-medium">{formatTime(next.startTime)}</div>
        </div>
      </div>

      {transport && (
        <div className="flex items-center justify-between bg-gray-700 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>{TRANSPORT_ICONS[transport.mode]}</span>
            <span>{TRANSPORT_LABELS[transport.mode]}</span>
            <span>·</span>
            <span>約 {formatDuration(transport.duration)}</span>
          </div>
          <button
            onClick={handleNavigate}
            className="flex items-center gap-1 text-blue-400 text-sm font-medium"
          >
            開啟導航
            <ExternalLink size={14} />
          </button>
        </div>
      )}

      {transport?.notes && (
        <div className="text-sm text-gray-400">{transport.notes}</div>
      )}

      {!transport && (
        <button
          onClick={handleNavigate}
          className="flex items-center gap-1.5 text-blue-400 text-sm font-medium"
        >
          <ExternalLink size={14} />
          開啟地圖導航
        </button>
      )}
    </div>
  )
}
