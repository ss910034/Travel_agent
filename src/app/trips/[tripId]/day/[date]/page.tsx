'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'
import { useTrip } from '@/hooks/useTrip'
import { useTripStore } from '@/stores/tripStore'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { ActivityForm } from '@/components/activities/ActivityForm'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils/dateUtils'
import { combineDateAndTime } from '@/lib/utils/dateUtils'
import type { Activity } from '@/types'

export default function DayPage({ params }: { params: { tripId: string; date: string } }) {
  const { tripId, date } = params
  const trip = useTrip(tripId)
  const { addActivity, updateActivity, deleteActivity } = useTripStore()
  const [addOpen, setAddOpen] = useState(false)
  const [editActivity, setEditActivity] = useState<Activity | null>(null)

  const day = trip?.days.find(d => d.date === date)

  const handleAdd = async (formData: Parameters<typeof ActivityForm>[0]['onSubmit'] extends (data: infer D) => unknown ? D : never) => {
    await addActivity(tripId, date, {
      name: formData.name,
      location: {
        name: formData.locationName,
        address: formData.locationAddress || undefined,
      },
      startTime: combineDateAndTime(date, formData.startTime),
      endTime: combineDateAndTime(date, formData.endTime),
      category: formData.category,
      notes: formData.notes || undefined,
      status: 'pending',
      transportToNext: formData.hasTransport && formData.transportMode
        ? {
            mode: formData.transportMode,
            duration: formData.transportDuration ?? 0,
            notes: formData.transportNotes || undefined,
          }
        : undefined,
    })
    setAddOpen(false)
  }

  const handleEdit = async (formData: Parameters<typeof handleAdd>[0]) => {
    if (!editActivity) return
    await updateActivity(tripId, date, editActivity.id, {
      name: formData.name,
      location: {
        name: formData.locationName,
        address: formData.locationAddress || undefined,
      },
      startTime: combineDateAndTime(date, formData.startTime),
      endTime: combineDateAndTime(date, formData.endTime),
      category: formData.category,
      notes: formData.notes || undefined,
      transportToNext: formData.hasTransport && formData.transportMode
        ? {
            mode: formData.transportMode,
            duration: formData.transportDuration ?? 0,
            notes: formData.transportNotes || undefined,
          }
        : undefined,
    })
    setEditActivity(null)
  }

  const handleDelete = async (activityId: string) => {
    if (!confirm('確定要刪除這個活動嗎？')) return
    await deleteActivity(tripId, date, activityId)
  }

  if (!trip || !day) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">載入中...</div>
  }

  const dayIndex = trip.days.findIndex(d => d.date === date)

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href={`/trips/${tripId}`} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="text-sm text-blue-600 font-medium">第 {dayIndex + 1} 天</div>
            <h1 className="text-lg font-bold text-gray-900">{formatDate(date)}</h1>
          </div>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700"
        >
          <Plus size={16} />
          新增活動
        </button>
      </div>

      {day.activities.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 mb-4">今天還沒有活動</p>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
          >
            <Plus size={16} /> 新增第一個活動
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {day.activities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              showStatus
              onEdit={() => setEditActivity(activity)}
              onDelete={() => handleDelete(activity.id)}
            />
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="新增活動">
        <ActivityForm date={date} onSubmit={handleAdd} submitLabel="新增活動" />
      </Modal>

      <Modal open={!!editActivity} onClose={() => setEditActivity(null)} title="編輯活動">
        {editActivity && (
          <ActivityForm
            date={date}
            defaultValues={editActivity}
            onSubmit={handleEdit}
            submitLabel="儲存變更"
          />
        )}
      </Modal>
    </div>
  )
}
