'use client'
import { useState, type ReactNode } from 'react'

/** Mount remote selectors only after the operator opens the form. */
export default function LazyDetails({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  const [opened, setOpened] = useState(false)
  return (
    <details
      className={className}
      onToggle={(event) => {
        if (event.currentTarget.open) setOpened(true)
      }}
    >
      <summary className="cursor-pointer font-semibold">{title}</summary>
      {opened && children}
    </details>
  )
}
