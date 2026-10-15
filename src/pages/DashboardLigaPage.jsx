import { useOutletContext } from 'react-router-dom'
import TarjetaAcceso from '../components/TarjetaAcceso'

const accesosPrincipales = [
  ['01', 'Equipos', 'Administra los equipos participantes.', '../equipos'],
  ['02', 'Jugadores', 'Gestiona los jugadores de la liga.', '../jugadores'],
  ['03', 'Partidos', 'Organiza el calendario de partidos.', '../partidos'],
  ['04', 'Noticias', 'Publica novedades de la competición.', '../noticias'],
]

const accesosSecundarios = [
  ['05', 'Partido en Directo', 'Registra los eventos del encuentro.', '../en-vivo'],
  ['06', 'Tabla de Posiciones', 'Consulta la clasificación de la liga.', '../tabla'],
  ['07', 'Estadísticas', 'Revisa el rendimiento deportivo.', '../estadisticas'],
]

function DashboardLigaPage() {
  const { liga } = useOutletContext()

  return (
    <>
      <section className="resumen-liga">
        <div><span className="etiqueta-superior">Liga actual</span><h2>{liga.nombre}</h2><p>Temporada {liga.temporada}</p></div>
        <span className={`estado-liga estado-${liga.estado}`}>{liga.estado}</span>
        {liga.descripcion && <p className="descripcion-liga">{liga.descripcion}</p>}
      </section>

      <section className="seccion-dashboard">
        <div className="seccion-titulo"><h2>Gestión principal</h2><p>Accede a los módulos principales de tu campeonato.</p></div>
        <div className="accesos-grid">{accesosPrincipales.map(([numero, titulo, descripcion, ruta]) => <TarjetaAcceso key={titulo} numero={numero} titulo={titulo} descripcion={descripcion} ruta={ruta} />)}</div>
      </section>

      <section className="seccion-dashboard">
        <div className="seccion-titulo"><h2>Competición</h2><p>Seguimiento deportivo y resultados de la liga.</p></div>
        <div className="accesos-grid accesos-secundarios">{accesosSecundarios.map(([numero, titulo, descripcion, ruta]) => <TarjetaAcceso key={titulo} numero={numero} titulo={titulo} descripcion={descripcion} ruta={ruta} />)}</div>
      </section>
    </>
  )
}

export default DashboardLigaPage
