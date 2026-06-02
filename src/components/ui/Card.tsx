import { cn } from '@/lib/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export function Card({ className, padding = true, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-2xl shadow-sm border border-gray-100', padding && 'p-4', className)}
      {...props}
    />
  )
}
