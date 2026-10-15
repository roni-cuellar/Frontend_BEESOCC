import { useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import HeaderDashboard from '../components/HeaderDashboard'
import Sidebar from '../components/Sidebar'
import { datosLocales, mismoId } from '../services/datosLocales'

const nombresSeccion = {
  dashboard: 'Dashboard', equipos: 'Equipos', jugadores: 'Jugadores', partidos: 'Partidos',
  'en-vivo': 'Partido en Directo', noticias: 'Noticias', tabla: 'Tabla de Posiciones', estadisticas: 'Estadísticas',
}

function DashboardLigaLayout({ ligaId }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const ubicacion = useLocation()
  const navegar = useNavigate()
  // La URL es suficiente para seleccionar una liga; no necesitamos estado global React.
  const liga = datosLocales.ligas.find((item) => mismoId(item.id, ligaId))
  const segmento = ubicacion.pathname.split('/').at(-1)
  const seccion = nombresSeccion[segmento] || 'Dashboard'

  if (!liga) {
    return <main className="pagina-error"><section><h1>Esta competición no existe en los datos de ejemplo.</h1><button type="button" onClick={() => navegar('/mis-ligas')}>Volver a Mis Ligas</button></section></main>
  }

  return (
    <main className="dashboard-layout">
      <Sidebar liga={liga} abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} onVolver={() => navegar('/mis-ligas')} onInicio={() => navegar('/')} />
      <section className="dashboard-principal">
        <HeaderDashboard seccion={seccion} nombreVisible="Demo · datos locales" onAbrirMenu={() => setMenuAbierto(true)} />
        <div className="dashboard-contenido"><Outlet context={{ liga }} /></div>
      </section>
    </main>
  )
}

function DashboardLayout() {
  const { ligaId } = useParams()
  // Al cambiar de liga reiniciamos menús, formularios y listas de sus módulos.
  return <DashboardLigaLayout key={ligaId} ligaId={ligaId} />
}

export default DashboardLayout
