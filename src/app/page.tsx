'use client'

import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'
import { useTrips } from '@/hooks/useTrip'
import { useTripStore } from '@/stores/tripStore'
import { TripCard } from '@/components/trips/TripCard'

export default function HomePage() {
  const { trips, loading } = useTrips()
  const { deleteTrip } = useTripStore()

  const activeTrips = trips.filter(t => t.status === 'active')
  const upcomingTrips = trips.filter(t => t.status === 'upcoming' || t.status === 'draft')
  const completedTrips = trips.filter(t => t.status === 'completed')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">載入中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">小旅</h1>
          <p className="text-sm text-gray-500">您的旅遊行程助手</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/trips/import"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            <Upload size={16} />
            匯入
          </Link>
          <Link
            href="/trips/new"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700"
          >
            <Plus size={16} />
            新增
          </Link>
        </div>
      </div>

      {trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">✈️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">尚無行程</h2>
          <p className="text-gray-500 mb-6 text-sm">建立您的第一個旅遊行程，或匯入現有行程</p>
          <div className="flex gap-3">
            <Link
              href="/trips/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
            >
              <Plus size={16} /> 建立行程
            </Link>
            <Link
              href="/trips/import"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium"
            >
              <Upload size={16} /> 匯入行程
            </Link>
          </div>
        </div>
      )}

      {activeTrips.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">進行中</h2>
          <div className="flex flex-col gap-3">
            {activeTrips.map(t => <TripCard key={t.id} trip={t} onDelete={deleteTrip} />)}
          </div>
        </section>
      )}

      {upcomingTrips.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">即將出發</h2>
          <div className="flex flex-col gap-3">
            {upcomingTrips.map(t => <TripCard key={t.id} trip={t} onDelete={deleteTrip} />)}
          </div>
        </section>
      )}

      {completedTrips.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">已完成</h2>
          <div className="flex flex-col gap-3">
            {completedTrips.map(t => <TripCard key={t.id} trip={t} onDelete={deleteTrip} />)}
          </div>
        </section>
      )}
    </div>
  )
}
