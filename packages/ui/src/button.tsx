import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-4 py-2',
        'bg-black text-white hover:opacity-90',
        className
      )}
      {...rest}
    />
  )
}
