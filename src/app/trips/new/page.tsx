'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TripForm } from '@/components/trips/TripForm'
import { useTripStore } from '@/stores/tripStore'

export default function NewTripPage() {
  const router = useRouter()
  const { addTrip } = useTripStore()

  const handleSubmit = async (data: Parameters<typeof addTrip>[0]) => {
    const trip = await addTrip(data)
    router.push(`/trips/${trip.id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">建立新行程</h1>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <TripForm onSubmit={handleSubmit} submitLabel="建立行程" />
      </div>
    </div>
  )
}
