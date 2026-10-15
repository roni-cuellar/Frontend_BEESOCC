import { NavLink } from 'react-router-dom'
import MarcaBeesocc from './MarcaBeesocc'

const opciones = [
  ['dashboard', 'Dashboard'],
  ['equipos', 'Equipos'],
  ['jugadores', 'Jugadores'],
  ['partidos', 'Partidos'],
  ['en-vivo', 'Partido en Directo'],
  ['noticias', 'Noticias'],
  ['tabla', 'Tabla de Posiciones'],
  ['estadisticas', 'Estadísticas'],
]

function Sidebar({ liga, abierto, onCerrar, onVolver, onInicio }) {
  return (
    <>
      {abierto && <button type="button" className="sidebar-overlay" aria-label="Cerrar menú" onClick={onCerrar} />}
      <aside className={`sidebar ${abierto ? 'sidebar-abierto' : ''}`}>
        <div className="marca-dashboard"><MarcaBeesocc compacta clara /><div className="sidebar-liga"><strong>{liga.nombre}</strong><span>Temporada {liga.temporada}</span></div></div>

        <nav aria-label="Módulos de la liga">
          {opciones.map(([ruta, etiqueta]) => (
            <NavLink
              key={ruta}
              to={ruta}
              onClick={onCerrar}
              className={({ isActive }) => isActive ? 'nav-activo' : undefined}
            >
              {etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-pie">
          <button type="button" onClick={onVolver}>← Mis Ligas</button>
          <button type="button" onClick={onInicio}>Volver al inicio</button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
