import type { Location } from '@/types'

export function getGoogleMapsUrl(location: Location): string {
  if (location.coordinates) {
    const { lat, lng } = location.coordinates
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  const query = encodeURIComponent(location.address ?? location.name)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

export function getAppleMapsUrl(location: Location): string {
  if (location.coordinates) {
    const { lat, lng } = location.coordinates
    return `maps://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(location.name)}`
  }
  const query = encodeURIComponent(location.address ?? location.name)
  return `maps://maps.apple.com/?q=${query}`
}

export function getNavigationUrl(location: Location): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isIOS = /iPhone|iPad|iPod/.test(ua)
  return isIOS ? getAppleMapsUrl(location) : getGoogleMapsUrl(location)
}
