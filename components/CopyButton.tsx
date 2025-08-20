'use client'

export default function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          alert('Enlace copiado')
        } catch {
          alert('No se pudo copiar')
        }
      }}
      className="rounded bg-white/10 px-3 py-1 hover:bg-white/20"
      title="Copiar enlace"
    >
      Copiar enlace
    </button>
  )
}
