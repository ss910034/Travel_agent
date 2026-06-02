import { z } from 'zod'
import type { Trip } from '@/types'

const LocationSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
})

const TransportSchema = z.object({
  mode: z.enum(['walking', 'transit', 'driving', 'taxi', 'cycling', 'ferry', 'flight']),
  duration: z.number().min(0),
  notes: z.string().optional(),
  externalUrl: z.string().optional(),
})

const ActivitySchema = z.object({
  id: z.string(),
  tripId: z.string(),
  name: z.string().min(1),
  location: LocationSchema,
  startTime: z.string(),
  endTime: z.string(),
  category: z.enum(['attraction', 'food', 'accommodation', 'transport', 'shopping', 'activity', 'free']),
  notes: z.string().optional(),
  transportToNext: TransportSchema.optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'skipped']).default('pending'),
  bookingReference: z.string().optional(),
})

const TripDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  activities: z.array(ActivitySchema),
  dayTitle: z.string().optional(),
  notes: z.string().optional(),
})

const TripSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  destination: z.string().min(1),
  days: z.array(TripDaySchema),
  currency: z.string().default('TWD'),
  status: z.enum(['draft', 'upcoming', 'active', 'completed']).default('draft'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ParseResult =
  | { success: true; trip: Trip }
  | { success: false; errors: string[] }

export function parseJsonTrip(raw: unknown): ParseResult {
  const result = TripSchema.safeParse(raw)
  if (result.success) {
    return { success: true, trip: result.data as Trip }
  }
  const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
  return { success: false, errors }
}
