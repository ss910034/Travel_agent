import {
  format,
  differenceInMinutes,
  isBefore,
  isAfter,
  parseISO,
} from 'date-fns'
import { zhTW } from 'date-fns/locale'

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年M月d日 (EEEE)', { locale: zhTW })
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'M月d日', { locale: zhTW })
}

export function formatTime(isoStr: string): string {
  return format(parseISO(isoStr), 'HH:mm')
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} 分鐘`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} 小時 ${m} 分鐘` : `${h} 小時`
}

export function formatRemainingTime(endTime: string): string {
  const now = new Date()
  const end = parseISO(endTime)
  const mins = differenceInMinutes(end, now)
  if (mins <= 0) return '已結束'
  return `剩餘 ${formatDuration(mins)}`
}

export function isActivityActive(startTime: string, endTime: string): boolean {
  const now = new Date()
  return isAfter(now, parseISO(startTime)) && isBefore(now, parseISO(endTime))
}

export function isActivityPending(startTime: string): boolean {
  return isBefore(new Date(), parseISO(startTime))
}

export function isActivityCompleted(endTime: string): boolean {
  return isAfter(new Date(), parseISO(endTime))
}

export function combineDateAndTime(date: string, time: string): string {
  return `${date}T${time}:00`
}

export function getTripDuration(startDate: string, endDate: string): number {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}
