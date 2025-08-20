'use client'

type Props = {
  id: string
  action: (formData: FormData) => void | Promise<void> // Server Action
  message?: string
  className?: string
  label?: string
  title?: string
}

export default function ConfirmDelete({
  id,
  action,
  message = '¿Seguro que deseas borrar esta sesión?',
  className = 'rounded bg-red-500/20 px-3 py-1 text-red-200 hover:bg-red-500/30',
  label = 'Borrar',
  title = 'Borrar',
}: Props) {
  return (
    <form
      action={async (formData) => {
        if (confirm(message)) {
          await action(formData)
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className} title={title}>
        {label}
      </button>
    </form>
  )
}
