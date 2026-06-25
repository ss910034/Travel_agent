'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface ExpenseSplit {
  id: string
  user_line_id: string
  user_name: string
  amount: number
}

interface Expense {
  id: string
  payer_name: string
  amount: number
  description: string
  split_type: string
  created_at: string
  expense_splits: ExpenseSplit[]
}

interface Settlement {
  from: string
  fromName: string
  to: string
  toName: string
  amount: number
}

interface Trip {
  id: string
  name: string
  status: string
  created_at: string
}

const API = process.env.NEXT_PUBLIC_MONEY_API_URL ?? ''

export default function ExpensePage() {
  const { tripId } = useParams<{ tripId: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [tab, setTab] = useState<'expenses' | 'settle'>('expenses')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId) return
    Promise.all([
      fetch(`${API}/api/trips/${tripId}`).then(r => r.json()),
      fetch(`${API}/api/trips/${tripId}/expenses`).then(r => r.json()),
      fetch(`${API}/api/trips/${tripId}/settle`).then(r => r.json()),
    ]).then(([t, e, s]) => {
      setTrip(t)
      setExpenses(e)
      setSettlements(s)
      setLoading(false)
    })
  }, [tripId])

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">載入中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-500 text-white px-4 pt-10 pb-6">
        <p className="text-sm opacity-80">旅程分帳</p>
        <h1 className="text-2xl font-bold mt-1">{trip?.name ?? '—'}</h1>
        <div className="mt-4 flex gap-4">
          <div>
            <p className="text-xs opacity-75">總消費</p>
            <p className="text-xl font-semibold">${total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs opacity-75">筆數</p>
            <p className="text-xl font-semibold">{expenses.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {(['expenses', 'settle'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500'
            }`}
          >
            {t === 'expenses' ? '消費明細' : '結算清單'}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {tab === 'expenses' ? (
          expenses.length === 0 ? (
            <p className="text-center text-gray-400 py-10">尚無消費紀錄</p>
          ) : (
            expenses.map(expense => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))
          )
        ) : (
          settlements.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-gray-600 font-medium">大家都平衡了！</p>
              <p className="text-gray-400 text-sm mt-1">不需要任何轉帳</p>
            </div>
          ) : (
            settlements.map((s, i) => (
              <SettlementCard key={i} settlement={s} />
            ))
          )
        )}
      </div>
    </div>
  )
}

function ExpenseCard({ expense }: { expense: Expense }) {
  const [open, setOpen] = useState(false)
  const date = new Date(expense.created_at).toLocaleDateString('zh-TW', {
    month: 'short', day: 'numeric',
  })

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden"
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-medium text-gray-800">{expense.description}</p>
          <p className="text-xs text-gray-400 mt-0.5">{expense.payer_name} · {date}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-800">${Number(expense.amount).toLocaleString()}</p>
          <p className="text-xs text-gray-400">
            {expense.split_type === 'custom' ? '自訂分攤' : '均分'}
          </p>
        </div>
      </div>
      {open && expense.expense_splits.length > 0 && (
        <div className="border-t px-4 py-3 bg-gray-50 space-y-1">
          {expense.expense_splits.map(s => (
            <div key={s.id} className="flex justify-between text-sm text-gray-600">
              <span>{s.user_name}</span>
              <span>${Number(s.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SettlementCard({ settlement }: { settlement: Settlement }) {
  return (
    <div className="bg-white rounded-xl shadow-sm px-4 py-4 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{settlement.fromName}</p>
        <p className="text-xs text-gray-400">支付給 {settlement.toName}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-green-600">${settlement.amount.toLocaleString()}</p>
      </div>
    </div>
  )
}
