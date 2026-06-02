import Papa from 'papaparse'
import { v4 as uuidv4 } from 'uuid'
import type { Activity, TripDay, TransportMode, ActivityCategory } from '@/types'
import { combineDateAndTime } from '@/lib/utils/dateUtils'

export interface CsvRow {
  [key: string]: string
}

export interface CsvFieldMapping {
  date: string
  startTime: string
  endTime: string
  name: string
  location: string
  transportMode?: string
  transportDuration?: string
  transportNotes?: string
  category?: string
  notes?: string
}

export interface CsvParseResult {
  rows: CsvRow[]
  headers: string[]
  errors: string[]
}

export function parseCsvFile(content: string): CsvParseResult {
  const result = Papa.parse<CsvRow>(content, {
    header: true,
    skipEmptyLines: true,
    transform: (value: string) => value.trim(),
  })

  return {
    rows: result.data,
    headers: result.meta.fields ?? [],
    errors: (result.errors as Array<{ row?: number; message: string }>).map(e => `第 ${e.row ?? '?'} 列：${e.message}`),
  }
}

const TRANSPORT_MAP: Record<string, TransportMode> = {
  步行: 'walking', walking: 'walking',
  大眾運輸: 'transit', 捷運: 'transit', 公車: 'transit', transit: 'transit',
  自駕: 'driving', 開車: 'driving', driving: 'driving',
  計程車: 'taxi', uber: 'taxi', taxi: 'taxi',
  騎車: 'cycling', cycling: 'cycling',
  渡輪: 'ferry', ferry: 'ferry',
  飛機: 'flight', flight: 'flight',
}

const CATEGORY_MAP: Record<string, ActivityCategory> = {
  景點: 'attraction', attraction: 'attraction',
  餐廳: 'food', 美食: 'food', food: 'food',
  住宿: 'accommodation', 飯店: 'accommodation', accommodation: 'accommodation',
  交通: 'transport', transport: 'transport',
  購物: 'shopping', shopping: 'shopping',
  活動: 'activity', activity: 'activity',
  自由: 'free', 自由時間: 'free', free: 'free',
}

export function convertRowsToTripDays(
  rows: CsvRow[],
  mapping: CsvFieldMapping,
  tripId: string
): { days: TripDay[]; errors: string[] } {
  const dayMap = new Map<string, Activity[]>()
  const errors: string[] = []

  rows.forEach((row, i) => {
    const lineNum = i + 2
    const date = row[mapping.date]?.trim()
    const startTime = row[mapping.startTime]?.trim()
    const endTime = row[mapping.endTime]?.trim()
    const name = row[mapping.name]?.trim()
    const locationName = row[mapping.location]?.trim()

    if (!date || !startTime || !endTime || !name || !locationName) {
      errors.push(`第 ${lineNum} 列：缺少必填欄位`)
      return
    }

    const transportModeRaw = mapping.transportMode ? row[mapping.transportMode]?.trim() : ''
    const transportDur = mapping.transportDuration ? parseInt(row[mapping.transportDuration] ?? '0') : 0
    const transportNotes = mapping.transportNotes ? row[mapping.transportNotes]?.trim() : ''
    const categoryRaw = mapping.category ? row[mapping.category]?.trim() : ''
    const notes = mapping.notes ? row[mapping.notes]?.trim() : ''

    const activity: Activity = {
      id: uuidv4(),
      tripId,
      name,
      location: { name: locationName },
      startTime: combineDateAndTime(date, startTime),
      endTime: combineDateAndTime(date, endTime),
      category: CATEGORY_MAP[categoryRaw] ?? 'activity',
      notes: notes || undefined,
      status: 'pending',
      transportToNext: transportModeRaw
        ? {
            mode: TRANSPORT_MAP[transportModeRaw] ?? 'transit',
            duration: isNaN(transportDur) ? 0 : transportDur,
            notes: transportNotes || undefined,
          }
        : undefined,
    }

    if (!dayMap.has(date)) dayMap.set(date, [])
    dayMap.get(date)!.push(activity)
  })

  const days: TripDay[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, activities]) => ({
      date,
      activities: activities.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }))

  return { days, errors }
}
