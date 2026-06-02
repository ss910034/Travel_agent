'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Upload, FileJson, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTripStore } from '@/stores/tripStore'
import { parseJsonTrip } from '@/lib/import/jsonParser'
import { parseCsvFile, convertRowsToTripDays, type CsvFieldMapping } from '@/lib/import/csvParser'
import type { Trip } from '@/types'
import { v4 as uuidv4 } from 'uuid'

type ImportMode = 'select' | 'json' | 'csv'

export default function ImportPage() {
  const router = useRouter()
  const { importTrip } = useTripStore()
  const [mode, setMode] = useState<ImportMode>('select')
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<Trip | null>(null)
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvMapping, setCsvMapping] = useState<CsvFieldMapping>({
    date: '', startTime: '', endTime: '', name: '', location: ''
  })
  const [csvMeta, setCsvMeta] = useState({ title: '', destination: '', startDate: '', endDate: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const handleJsonFile = async (file: File) => {
    const text = await file.text()
    let raw: unknown
    try { raw = JSON.parse(text) } catch {
      setErrors(['JSON 格式錯誤，請確認檔案內容'])
      return
    }
    const result = parseJsonTrip(raw)
    if (result.success) {
      setPreview(result.trip)
      setErrors([])
    } else {
      setErrors(result.errors)
    }
  }

  const handleCsvFile = async (file: File) => {
    const text = await file.text()
    const result = parseCsvFile(text)
    setCsvRows(result.rows)
    setCsvHeaders(result.headers)
    setErrors(result.errors)
    if (result.headers.length > 0) {
      const guess = (keywords: string[]) =>
        result.headers.find(h => keywords.some(k => h.toLowerCase().includes(k))) ?? ''
      setCsvMapping({
        date: guess(['date', '日期']),
        startTime: guess(['start', '開始', 'begin']),
        endTime: guess(['end', '結束', 'finish']),
        name: guess(['name', '名稱', '活動']),
        location: guess(['location', '地點', 'place']),
        transportMode: guess(['transport', '交通', 'mode']),
        transportDuration: guess(['duration', '時間', '分鐘']),
        transportNotes: guess(['notes', '說明', '備註']),
        category: guess(['category', '類別', '類型']),
      })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrors([])
    setPreview(null)
    if (mode === 'json') await handleJsonFile(file)
    else if (mode === 'csv') await handleCsvFile(file)
  }

  const handleCsvPreview = () => {
    if (!csvMeta.title || !csvMeta.destination || !csvMeta.startDate || !csvMeta.endDate) {
      setErrors(['請填寫行程基本資訊'])
      return
    }
    const tripId = uuidv4()
    const { days, errors: convErrors } = convertRowsToTripDays(csvRows, csvMapping, tripId)
    if (convErrors.length > 0) {
      setErrors(convErrors)
      return
    }
    const now = new Date().toISOString()
    const trip: Trip = {
      id: tripId,
      title: csvMeta.title,
      destination: csvMeta.destination,
      startDate: csvMeta.startDate,
      endDate: csvMeta.endDate,
      days,
      currency: 'TWD',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }
    setPreview(trip)
    setErrors([])
  }

  const handleImport = async () => {
    if (!preview) return
    await importTrip(preview)
    router.push(`/trips/${preview.id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">匯入行程</h1>
      </div>

      {mode === 'select' && (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setMode('json')}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left flex items-center gap-4 hover:border-blue-200"
          >
            <div className="bg-blue-50 rounded-xl p-3">
              <FileJson size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">JSON 格式</div>
              <div className="text-sm text-gray-500 mt-0.5">從小旅匯出的行程檔案或自訂 JSON</div>
            </div>
          </button>

          <button
            onClick={() => setMode('csv')}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left flex items-center gap-4 hover:border-blue-200"
          >
            <div className="bg-green-50 rounded-xl p-3">
              <FileText size={24} className="text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">CSV 格式</div>
              <div className="text-sm text-gray-500 mt-0.5">Excel 或試算表匯出的行程檔案</div>
            </div>
          </button>

          <div className="mt-4 bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
            <strong>CSV 必填欄位：</strong>日期、開始時間、結束時間、活動名稱、地點名稱
          </div>
        </div>
      )}

      {(mode === 'json' || mode === 'csv') && !preview && (
        <div className="flex flex-col gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
          >
            <Upload size={32} className="mx-auto mb-3 text-gray-400" />
            <p className="font-medium text-gray-700">點選上傳 {mode === 'json' ? 'JSON' : 'CSV'} 檔案</p>
            <p className="text-sm text-gray-400 mt-1">或拖曳檔案到此區域</p>
            <input
              ref={fileRef}
              type="file"
              accept={mode === 'json' ? '.json' : '.csv'}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 flex flex-col gap-1">
              {errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {e}
                </div>
              ))}
            </div>
          )}

          {mode === 'csv' && csvHeaders.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-gray-900">行程基本資訊</h3>
              <div className="flex flex-col gap-3">
                {[
                  { key: 'title', label: '行程名稱', placeholder: '東京五日遊' },
                  { key: 'destination', label: '目的地', placeholder: '東京，日本' },
                  { key: 'startDate', label: '出發日期', type: 'date' },
                  { key: 'endDate', label: '返回日期', type: 'date' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type={type ?? 'text'}
                      placeholder={placeholder}
                      value={csvMeta[key as keyof typeof csvMeta]}
                      onChange={e => setCsvMeta(m => ({ ...m, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-gray-900">欄位對應</h3>
              <div className="flex flex-col gap-3">
                {([
                  ['date', '日期欄位 *'],
                  ['startTime', '開始時間欄位 *'],
                  ['endTime', '結束時間欄位 *'],
                  ['name', '活動名稱欄位 *'],
                  ['location', '地點名稱欄位 *'],
                  ['category', '類別欄位'],
                  ['transportMode', '交通方式欄位'],
                  ['transportDuration', '交通時間欄位（分鐘）'],
                  ['transportNotes', '交通說明欄位'],
                ] as [keyof CsvFieldMapping, string][]).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <select
                      value={csvMapping[field] ?? ''}
                      onChange={e => setCsvMapping(m => ({ ...m, [field]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">（不對應）</option>
                      {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <Button onClick={handleCsvPreview} className="w-full">預覽行程</Button>
            </div>
          )}
        </div>
      )}

      {preview && (
        <div className="flex flex-col gap-4">
          <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 shrink-0" />
            <div>
              <div className="font-medium text-green-900">解析成功</div>
              <div className="text-sm text-green-700">
                {preview.title} · {preview.days.length} 天 ·
                {preview.days.reduce((s, d) => s + d.activities.length, 0)} 個活動
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {preview.days.slice(0, 3).map((day, i) => (
              <div key={day.date} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                <div className="text-sm font-medium text-gray-700 mb-1">第 {i + 1} 天 · {day.date}</div>
                {day.activities.slice(0, 2).map(a => (
                  <div key={a.id} className="text-sm text-gray-500">· {a.name}（{a.location.name}）</div>
                ))}
                {day.activities.length > 2 && (
                  <div className="text-xs text-gray-400">還有 {day.activities.length - 2} 個...</div>
                )}
              </div>
            ))}
            {preview.days.length > 3 && (
              <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-400">
                ...還有 {preview.days.length - 3} 天
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setPreview(null); setErrors([]) }} className="flex-1">
              重新選擇
            </Button>
            <Button onClick={handleImport} className="flex-1">
              匯入行程
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
