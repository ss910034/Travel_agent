'use client'

import { use } from 'react'
import { useTrip } from '@/hooks/useTrip'
import { NavigateScreen } from '@/components/navigate/NavigateScreen'

export default function NavigatePage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const trip = useTrip(tripId)

  if (!trip) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">載入中...</div>
      </div>
    )
  }

  return <NavigateScreen trip={trip} />
}
