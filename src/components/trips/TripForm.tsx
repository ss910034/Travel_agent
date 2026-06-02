'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  title: z.string().min(1, '請輸入行程名稱'),
  destination: z.string().min(1, '請輸入目的地'),
  startDate: z.string().min(1, '請選擇出發日期'),
  endDate: z.string().min(1, '請選擇返回日期'),
  description: z.string().optional(),
  currency: z.string(),
}).refine(d => d.endDate >= d.startDate, {
  message: '返回日期不能早於出發日期',
  path: ['endDate'],
})

type FormData = z.infer<typeof schema>

interface TripFormProps {
  defaultValues?: Partial<FormData>
  onSubmit: (data: FormData) => Promise<void>
  submitLabel?: string
}

export function TripForm({ defaultValues, onSubmit, submitLabel = '建立行程' }: TripFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'TWD', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">行程名稱 *</label>
        <input
          {...register('title')}
          placeholder="例：東京五日遊"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">目的地 *</label>
        <input
          {...register('destination')}
          placeholder="例：東京，日本"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">出發日期 *</label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">返回日期 *</label>
          <input
            type="date"
            {...register('endDate')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
        <textarea
          {...register('description')}
          placeholder="行程簡介..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full mt-2">
        {isSubmitting ? '處理中...' : submitLabel}
      </Button>
    </form>
  )
}
