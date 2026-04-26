import { lazy, Suspense } from 'react'
import { FabricSku } from './components/FabricSku'
import { Hero } from './components/Hero'
import { defaultContent } from './data/content'
import './App.css'

const AdminPage = import.meta.env.DEV
  ? lazy(() => import('./components/AdminPage').then((module) => ({
      default: module.AdminPage,
    })))
  : null

function App() {
  if (import.meta.env.DEV && window.location.pathname === '/admin' && AdminPage) {
    return (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    )
  }

  return (
    <main className="site-shell">
      <Hero hero={defaultContent.hero} />

      <div className="collection-sections" aria-label="Fabric collection">
        {defaultContent.fabrics.map((fabric) => (
          <FabricSku key={fabric.id} fabric={fabric} />
        ))}
      </div>
    </main>
  )
}

export default App
