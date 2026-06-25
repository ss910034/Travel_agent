import type { Metadata } from 'next'
export const metadata: Metadata = { title: '分帳明細 | Travel Money' }
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
