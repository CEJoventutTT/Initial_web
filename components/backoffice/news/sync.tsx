'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { synchronizeNews } from '@/app/admin/news/actions'
export default function NewsSync() {
  const [pending, startTransition] = useTransition(),
    [result, setResult] = useState<{ ok: boolean; message: string } | null>(
      null,
    )
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => setResult(await synchronizeNews()))
        }
      >
        {pending ? 'Sincronizando…' : 'Sincronizar ahora desde Medium'}
      </Button>
      {result && (
        <p role={result.ok ? 'status' : 'alert'} className="text-sm">
          {result.message}
        </p>
      )}
    </div>
  )
}
