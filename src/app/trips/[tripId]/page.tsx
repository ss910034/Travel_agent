'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Play, Trash2, Calendar, MapPin, Download } from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { useTripStore } from '@/stores/tripStore'
import { formatShortDate } from '@/lib/utils/dateUtils'
import { CATEGORY_ICONS } from '@/types'

export default function TripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const trip = useTrip(tripId)
  const router = useRouter()
  const { deleteTrip } = useTripStore()

  const handleDelete = async () => {
    if (!confirm('確定要刪除這個行程嗎？')) return
    await deleteTrip(tripId)
    router.push('/')
  }

  const handleExport = () => {
    if (!trip) return
    const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trip.title}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">載入中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{trip.title}</h1>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={12} />
              <span>{trip.destination}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={handleExport} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <Download size={18} />
          </button>
          <button onClick={handleDelete} className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {trip.status === 'active' && (
        <Link
          href={`/trips/${trip.id}/navigate`}
          className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white rounded-2xl font-semibold text-base mb-6"
        >
          <Play size={18} fill="white" />
          開始今日旅程導航
        </Link>
      )}

      {trip.description && (
        <p className="text-sm text-gray-600 mb-6 bg-white rounded-xl px-4 py-3 border border-gray-100">{trip.description}</p>
      )}

      <div className="flex flex-col gap-3">
        {trip.days.map((day, idx) => {
          const actCount = day.activities.length
          return (
            <Link key={day.date} href={`/trips/${trip.id}/day/${day.date}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                      第 {idx + 1} 天
                    </span>
                    {day.dayTitle && <span className="text-sm font-medium text-gray-700">{day.dayTitle}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Calendar size={14} />
                    <span>{formatShortDate(day.date)}</span>
                  </div>
                </div>
                {actCount === 0 ? (
                  <p className="text-sm text-gray-400">尚無活動，點選新增</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {day.activities.slice(0, 3).map(a => (
                      <div key={a.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{CATEGORY_ICONS[a.category]}</span>
                        <span>{a.name}</span>
                        <span className="text-gray-400 text-xs ml-auto">
                          {a.startTime.split('T')[1]?.slice(0, 5)}
                        </span>
                      </div>
                    ))}
                    {actCount > 3 && (
                      <div className="text-xs text-gray-400 mt-1">還有 {actCount - 3} 個活動...</div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
