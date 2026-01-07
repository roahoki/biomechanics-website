import Link from 'next/link'

export const metadata = {
  title: 'Biomechanics | Home',
  description: 'Landing experimental de biomechanics.cl',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">Biomechanics</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Home</h1>
          <p className="max-w-2xl text-lg text-neutral-300">
            Espacio de bienvenida para experimentar con contenido, rutas y módulos del sitio.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-xl font-semibold">Links en vivo</h2>
            <p className="mt-2 text-neutral-300">
              Accede a la experiencia pública actual y verifica los cambios en contexto.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/" className="rounded-full bg-white text-black px-4 py-2 text-sm font-medium transition hover:bg-neutral-200">
                Abrir landing principal
              </Link>
              <Link href="/links" className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:border-white/70">
                Ver /links
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-xl font-semibold">Panel admin</h2>
            <p className="mt-2 text-neutral-300">
              Gestiona links, items y categorías desde el panel protegido.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/admin" className="rounded-full bg-white text-black px-4 py-2 text-sm font-medium transition hover:bg-neutral-200">
                Ir al admin
              </Link>
              <Link href="/sign-in" className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:border-white/70">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-neutral-300">
          <h3 className="text-lg font-semibold text-white">Notas</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            <li>• Esta página está en /home dentro del App Router.</li>
            <li>• Úsala para experimentos; ajusta contenido o componentes según sea necesario.</li>
            <li>• La navegación usa los estilos globales del layout principal.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
