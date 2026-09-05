'use client'

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section className="bo-panel" role="alert">
      <h2 className="text-xl font-bold">No se pudieron cargar los datos</h2>
      <p className="my-4">Comprueba la conexión e inténtalo de nuevo.</p>
      <button className="bo-button" onClick={reset}>
        Reintentar
      </button>
    </section>
  )
}
