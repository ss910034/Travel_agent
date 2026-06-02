'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { CATEGORY_LABELS, TRANSPORT_LABELS } from '@/types'
import type { Activity } from '@/types'

const schema = z.object({
  name: z.string().min(1, '請輸入活動名稱'),
  locationName: z.string().min(1, '請輸入地點名稱'),
  locationAddress: z.string().optional(),
  startTime: z.string().min(1, '請選擇開始時間'),
  endTime: z.string().min(1, '請選擇結束時間'),
  category: z.enum(['attraction', 'food', 'accommodation', 'transport', 'shopping', 'activity', 'free']),
  notes: z.string().optional(),
  hasTransport: z.boolean(),
  transportMode: z.enum(['walking', 'transit', 'driving', 'taxi', 'cycling', 'ferry', 'flight']).optional(),
  transportDuration: z.coerce.number().min(0).optional(),
  transportNotes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ActivityFormProps {
  date: string
  defaultValues?: Partial<Activity>
  onSubmit: (data: FormData) => Promise<void>
  submitLabel?: string
}

export function ActivityForm({ defaultValues, onSubmit, submitLabel = '新增活動' }: ActivityFormProps) {
  const defaultStart = defaultValues?.startTime?.split('T')[1]?.slice(0, 5) ?? ''
  const defaultEnd = defaultValues?.endTime?.split('T')[1]?.slice(0, 5) ?? ''

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      locationName: defaultValues?.location?.name ?? '',
      locationAddress: defaultValues?.location?.address ?? '',
      startTime: defaultStart,
      endTime: defaultEnd,
      category: defaultValues?.category ?? 'attraction',
      notes: defaultValues?.notes ?? '',
      hasTransport: !!defaultValues?.transportToNext,
      transportMode: defaultValues?.transportToNext?.mode ?? 'transit',
      transportDuration: defaultValues?.transportToNext?.duration ?? 15,
      transportNotes: defaultValues?.transportToNext?.notes ?? '',
    },
  })

  const hasTransport = watch('hasTransport')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">活動名稱 *</label>
        <input
          {...register('name')}
          placeholder="例：參觀故宮博物院"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
        <select
          {...register('category')}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {(Object.entries(CATEGORY_LABELS) as [Activity['category'], string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">地點名稱 *</label>
        <input
          {...register('locationName')}
          placeholder="例：故宮博物院"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.locationName && <p className="text-red-500 text-xs mt-1">{errors.locationName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">詳細地址</label>
        <input
          {...register('locationAddress')}
          placeholder="（選填）"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開始時間 *</label>
          <input
            type="time"
            {...register('startTime')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">結束時間 *</label>
          <input
            type="time"
            {...register('endTime')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
        <textarea
          {...register('notes')}
          placeholder="（選填）"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="border border-gray-100 rounded-xl p-3 flex flex-col gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('hasTransport')} className="rounded" />
          <span className="text-sm font-medium text-gray-700">前往下一個景點的交通方式</span>
        </label>

        {hasTransport && (
          <div className="flex flex-col gap-3 pl-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">交通方式</label>
                <select
                  {...register('transportMode')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Object.entries(TRANSPORT_LABELS) as [string, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">所需時間（分鐘）</label>
                <input
                  type="number"
                  min="0"
                  {...register('transportDuration')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">交通說明</label>
              <input
                {...register('transportNotes')}
                placeholder="例：搭捷運紅線到台北車站"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
        {isSubmitting ? '處理中...' : submitLabel}
      </Button>
    </form>
  )
}
