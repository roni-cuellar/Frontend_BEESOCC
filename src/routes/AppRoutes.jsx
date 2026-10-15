import { Navigate, Route, Routes } from 'react-router-dom'
import InicioPage from '../pages/InicioPage'
import DashboardLigaPage from '../pages/DashboardLigaPage'
import EquiposPage from '../pages/EquiposPage'
import EstadisticasPage from '../pages/EstadisticasPage'
import JugadoresPage from '../pages/JugadoresPage'
import MisLigasPage from '../pages/MisLigasPage'
import NoticiasPage from '../pages/NoticiasPage'
import PartidoEnVivoPage from '../pages/PartidoEnVivoPage'
import PartidosPage from '../pages/PartidosPage'
import TablaPosicionesPage from '../pages/TablaPosicionesPage'
import DashboardLayout from '../layouts/DashboardLayout'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<InicioPage />} />
      <Route path="/mis-ligas" element={<MisLigasPage />} />
      <Route path="/ligas/:ligaId" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardLigaPage />} />
        <Route path="equipos" element={<EquiposPage />} />
        <Route path="jugadores" element={<JugadoresPage />} />
        <Route path="partidos" element={<PartidosPage />} />
        <Route path="en-vivo" element={<PartidoEnVivoPage />} />
        <Route path="noticias" element={<NoticiasPage />} />
        <Route path="tabla" element={<TablaPosicionesPage />} />
        <Route path="estadisticas" element={<EstadisticasPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
