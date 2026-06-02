export type TransportMode =
  | 'walking'
  | 'transit'
  | 'driving'
  | 'taxi'
  | 'cycling'
  | 'ferry'
  | 'flight'

export type ActivityCategory =
  | 'attraction'
  | 'food'
  | 'accommodation'
  | 'transport'
  | 'shopping'
  | 'activity'
  | 'free'

export type ActivityStatus = 'pending' | 'in-progress' | 'completed' | 'skipped'

export type TripStatus = 'draft' | 'upcoming' | 'active' | 'completed'

export interface Coordinates {
  lat: number
  lng: number
}

export interface Location {
  name: string
  address?: string
  coordinates?: Coordinates
}

export interface Transport {
  mode: TransportMode
  duration: number
  notes?: string
  externalUrl?: string
}

export interface Activity {
  id: string
  tripId: string
  name: string
  location: Location
  startTime: string
  endTime: string
  category: ActivityCategory
  notes?: string
  transportToNext?: Transport
  status: ActivityStatus
  bookingReference?: string
}

export interface TripDay {
  date: string
  activities: Activity[]
  dayTitle?: string
  notes?: string
}

export interface Trip {
  id: string
  title: string
  description?: string
  coverImage?: string
  startDate: string
  endDate: string
  destination: string
  days: TripDay[]
  currency: string
  status: TripStatus
  createdAt: string
  updatedAt: string
}

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  walking: '步行',
  transit: '大眾運輸',
  driving: '自駕',
  taxi: '計程車',
  cycling: '騎車',
  ferry: '渡輪',
  flight: '飛機',
}

export const TRANSPORT_ICONS: Record<TransportMode, string> = {
  walking: '🚶',
  transit: '🚇',
  driving: '🚗',
  taxi: '🚕',
  cycling: '🚲',
  ferry: '⛴️',
  flight: '✈️',
}

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  attraction: '景點',
  food: '餐廳',
  accommodation: '住宿',
  transport: '交通',
  shopping: '購物',
  activity: '活動',
  free: '自由時間',
}

export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  attraction: '🏛',
  food: '🍽',
  accommodation: '🏨',
  transport: '🚌',
  shopping: '🛍',
  activity: '🎯',
  free: '☀️',
}
