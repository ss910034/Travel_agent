import type { Transport } from '@/types'
import { TRANSPORT_ICONS, TRANSPORT_LABELS } from '@/types'
import { formatDuration } from '@/lib/utils/dateUtils'

export function TransportBadge({ transport }: { transport: Transport }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
      <span>{TRANSPORT_ICONS[transport.mode]}</span>
      <span>{TRANSPORT_LABELS[transport.mode]}</span>
      <span>·</span>
      <span>約 {formatDuration(transport.duration)}</span>
      {transport.notes && (
        <>
          <span>·</span>
          <span className="text-gray-400">{transport.notes}</span>
        </>
      )}
    </div>
  )
}
