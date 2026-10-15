import { useState } from 'react'
import { useParams } from 'react-router-dom'
import EstadisticaEquipoCard from '../components/EstadisticaEquipoCard'
import TablaEstadistica from '../components/TablaEstadistica'
import { useBeesoccStore } from '../stores/beesoccStore'
import { seleccionarEstadistica } from '../stores/selectores'

const categorias = {
  goleadores: { nombre: 'Goleadores', campo: 'goles', valor: 'Goles', vacio: 'Aún no hay goles registrados en esta liga.' },
  asistencias: { nombre: 'Asistencias', campo: 'asistencias', valor: 'Asistencias', vacio: 'Aún no hay asistencias registradas.' },
  amarillas: { nombre: 'Amarillas', campo: 'amarillas', valor: 'Amarillas', vacio: 'Aún no hay tarjetas amarillas registradas.' },
  rojas: { nombre: 'Rojas', campo: 'rojas', valor: 'Rojas', vacio: 'Aún no hay tarjetas rojas registradas.' },
  faltas: { nombre: 'Faltas', campo: 'faltas', valor: 'Faltas', vacio: 'Aún no hay faltas registradas.' },
  equipos: { nombre: 'Equipos', campo: 'equipos', vacio: 'Aún no hay estadísticas de equipos.' },
}

function EstadisticasPage() {
  const equipos = useBeesoccStore((estado) => estado.equipos)
  const jugadores = useBeesoccStore((estado) => estado.jugadores)
  const eventos = useBeesoccStore((estado) => estado.eventos)
  const [categoriaActiva, setCategoriaActiva] = useState('goleadores')
  const { ligaId } = useParams()
  const configuracion = categorias[categoriaActiva]
  const datos = seleccionarEstadistica({ equipos, jugadores, eventos }, ligaId, categoriaActiva)

  return (
    <section className="estadisticas-page">
      <div className="modulo-header"><div><span className="etiqueta-superior">Rendimiento</span><h2>Estadísticas</h2><p>Consulta el rendimiento de jugadores y equipos de esta liga.</p></div></div>
      <nav className="pestanas-estadisticas" aria-label="Categorías de estadísticas">{Object.entries(categorias).map(([clave, categoria]) => <button key={clave} type="button" className={categoriaActiva === clave ? 'pestana-activa' : ''} onClick={() => setCategoriaActiva(clave)}>{categoria.nombre}</button>)}</nav>

      <div className="estadisticas-contenido">
        {categoriaActiva === 'equipos' ? (
          datos?.length ? <div className="estadisticas-equipos-grid">{datos.map((equipo) => <EstadisticaEquipoCard key={equipo.equipo_id} equipo={equipo} />)}</div> : <div className="estado-vacio estado-vacio--compacto"><span>+</span><p>{configuracion.vacio}</p></div>
        ) : <TablaEstadistica datos={datos || []} campoValor={configuracion.campo} nombreValor={configuracion.valor} mensajeVacio={configuracion.vacio} />}
      </div>
    </section>
  )
}

export default EstadisticasPage


