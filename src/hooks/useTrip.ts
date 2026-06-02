'use client'

import { useEffect } from 'react'
import { useTripStore } from '@/stores/tripStore'

export function useTrips() {
  const { trips, loading, loadTrips } = useTripStore()
  useEffect(() => { loadTrips() }, [loadTrips])
  return { trips, loading }
}

export function useTrip(id: string) {
  const { getTripById, loadTrips } = useTripStore()
  useEffect(() => { loadTrips() }, [loadTrips])
  return getTripById(id)
}
