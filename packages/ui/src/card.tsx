import { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('rounded-xl border p-4', className)} {...rest} />
  )
}
