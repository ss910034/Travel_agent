'use client'

import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db/schema'
import type { Trip, TripDay, Activity } from '@/types'
import { getTripDuration } from '@/lib/utils/dateUtils'
import { addDays, format } from 'date-fns'
import { parseISO } from 'date-fns'

interface TripStore {
  trips: Trip[]
  loading: boolean
  loadTrips: () => Promise<void>
  addTrip: (data: Omit<Trip, 'id' | 'days' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Trip>
  updateTrip: (id: string, data: Partial<Trip>) => Promise<void>
  deleteTrip: (id: string) => Promise<void>
  importTrip: (trip: Trip) => Promise<void>
  addActivity: (tripId: string, date: string, activity: Omit<Activity, 'id' | 'tripId'>) => Promise<void>
  updateActivity: (tripId: string, date: string, activityId: string, data: Partial<Activity>) => Promise<void>
  deleteActivity: (tripId: string, date: string, activityId: string) => Promise<void>
  reorderActivities: (tripId: string, date: string, activities: Activity[]) => Promise<void>
  getTripById: (id: string) => Trip | undefined
}

function computeTripStatus(startDate: string, endDate: string): Trip['status'] {
  const now = new Date()
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  if (now < start) return 'upcoming'
  if (now > end) return 'completed'
  return 'active'
}

function buildEmptyDays(startDate: string, endDate: string): TripDay[] {
  const count = getTripDuration(startDate, endDate)
  return Array.from({ length: count }, (_, i) => ({
    date: format(addDays(parseISO(startDate), i), 'yyyy-MM-dd'),
    activities: [],
  }))
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  loading: false,

  loadTrips: async () => {
    set({ loading: true })
    const trips = await db.trips.toArray()
    set({ trips, loading: false })
  },

  addTrip: async (data) => {
    const now = new Date().toISOString()
    const trip: Trip = {
      ...data,
      id: uuidv4(),
      days: buildEmptyDays(data.startDate, data.endDate),
      status: computeTripStatus(data.startDate, data.endDate),
      createdAt: now,
      updatedAt: now,
    }
    await db.trips.add(trip)
    set(s => ({ trips: [...s.trips, trip] }))
    return trip
  },

  updateTrip: async (id, data) => {
    const updated = { ...data, updatedAt: new Date().toISOString() }
    await db.trips.update(id, updated)
    set(s => ({ trips: s.trips.map(t => t.id === id ? { ...t, ...updated } : t) }))
  },

  deleteTrip: async (id) => {
    await db.trips.delete(id)
    set(s => ({ trips: s.trips.filter(t => t.id !== id) }))
  },

  importTrip: async (trip) => {
    const existing = await db.trips.get(trip.id)
    if (existing) {
      await db.trips.put(trip)
      set(s => ({ trips: s.trips.map(t => t.id === trip.id ? trip : t) }))
    } else {
      await db.trips.add(trip)
      set(s => ({ trips: [...s.trips, trip] }))
    }
  },

  addActivity: async (tripId, date, activityData) => {
    const activity: Activity = { ...activityData, id: uuidv4(), tripId }
    const trip = get().trips.find(t => t.id === tripId)
    if (!trip) return
    const days = trip.days.map(d => {
      if (d.date !== date) return d
      const activities = [...d.activities, activity].sort((a, b) => a.startTime.localeCompare(b.startTime))
      return { ...d, activities }
    })
    await get().updateTrip(tripId, { days })
  },

  updateActivity: async (tripId, date, activityId, data) => {
    const trip = get().trips.find(t => t.id === tripId)
    if (!trip) return
    const days = trip.days.map(d => {
      if (d.date !== date) return d
      return { ...d, activities: d.activities.map(a => a.id === activityId ? { ...a, ...data } : a) }
    })
    await get().updateTrip(tripId, { days })
  },

  deleteActivity: async (tripId, date, activityId) => {
    const trip = get().trips.find(t => t.id === tripId)
    if (!trip) return
    const days = trip.days.map(d => {
      if (d.date !== date) return d
      return { ...d, activities: d.activities.filter(a => a.id !== activityId) }
    })
    await get().updateTrip(tripId, { days })
  },

  reorderActivities: async (tripId, date, activities) => {
    const trip = get().trips.find(t => t.id === tripId)
    if (!trip) return
    const days = trip.days.map(d => d.date === date ? { ...d, activities } : d)
    await get().updateTrip(tripId, { days })
  },

  getTripById: (id) => get().trips.find(t => t.id === id),
}))
