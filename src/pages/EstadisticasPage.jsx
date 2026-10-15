import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import EstadisticaEquipoCard from '../components/EstadisticaEquipoCard'
import TablaEstadistica from '../components/TablaEstadistica'
import { obtenerAmarillas, obtenerAsistencias, obtenerEstadisticasEquipos, obtenerFaltas, obtenerGoleadores, obtenerRojas } from '../services/estadisticaService'

const categorias = {
  goleadores: { nombre: 'Goleadores', campo: 'goles', valor: 'Goles', vacio: 'Aún no hay goles registrados en esta liga.', cargar: obtenerGoleadores },
  asistencias: { nombre: 'Asistencias', campo: 'asistencias', valor: 'Asistencias', vacio: 'Aún no hay asistencias registradas.', cargar: obtenerAsistencias },
  amarillas: { nombre: 'Amarillas', campo: 'amarillas', valor: 'Amarillas', vacio: 'Aún no hay tarjetas amarillas registradas.', cargar: obtenerAmarillas },
  rojas: { nombre: 'Rojas', campo: 'rojas', valor: 'Rojas', vacio: 'Aún no hay tarjetas rojas registradas.', cargar: obtenerRojas },
  faltas: { nombre: 'Faltas', campo: 'faltas', valor: 'Faltas', vacio: 'Aún no hay faltas registradas.', cargar: obtenerFaltas },
  equipos: { nombre: 'Equipos', campo: 'equipos', vacio: 'Aún no hay estadísticas de equipos.', cargar: obtenerEstadisticasEquipos },
}

function EstadisticasPage() {
  const [seleccion, setSeleccion] = useState({ ligaId: null, categoria: 'goleadores' })
  const [datosPorCategoria, setDatosPorCategoria] = useState({})
  const [cargando, setCargando] = useState(true)
  const [errores, setErrores] = useState([])
  const { ligaId } = useParams()
  const categoriaActiva = seleccion.ligaId === ligaId ? seleccion.categoria : 'goleadores'
  const claveCache = `${ligaId}:${categoriaActiva}`
  const configuracion = categorias[categoriaActiva]
  const datos = datosPorCategoria[claveCache]

  useEffect(() => {
    let activo = true
    async function cargarEstadistica() {
      if (datosPorCategoria[claveCache]) {
        setCargando(false)
        return
      }
      setCargando(true)
      setErrores([])
      try {
        // Consultamos únicamente la categoría seleccionada.
        const respuesta = await categorias[categoriaActiva].cargar(ligaId)
        if (activo) setDatosPorCategoria((actuales) => ({ ...actuales, [claveCache]: respuesta.data[categorias[categoriaActiva].campo] }))
      } catch (error) {
        if (activo) setErrores([obtenerErrores(error)[0]])
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarEstadistica()
    return () => { activo = false }
  }, [categoriaActiva, claveCache, datosPorCategoria, ligaId])

  return (
    <section className="estadisticas-page">
      <div className="modulo-header"><div><span className="etiqueta-superior">Rendimiento</span><h2>Estadísticas</h2><p>Consulta el rendimiento de jugadores y equipos de esta liga.</p></div></div>
      <nav className="pestanas-estadisticas" aria-label="Categorías de estadísticas">{Object.entries(categorias).map(([clave, categoria]) => <button key={clave} type="button" className={categoriaActiva === clave ? 'pestana-activa' : ''} onClick={() => setSeleccion({ ligaId, categoria: clave })}>{categoria.nombre}</button>)}</nav>
      <ErroresFormulario mensajes={errores} />
      <div className="estadisticas-contenido">
        {cargando ? <p className="mensaje-estado">Cargando estadísticas...</p> : categoriaActiva === 'equipos' ? (
          datos?.length ? <div className="estadisticas-equipos-grid">{datos.map((equipo) => <EstadisticaEquipoCard key={equipo.equipo_id} equipo={equipo} />)}</div> : <div className="estado-vacio estado-vacio--compacto"><span>+</span><p>{configuracion.vacio}</p></div>
        ) : <TablaEstadistica datos={datos || []} campoValor={configuracion.campo} nombreValor={configuracion.valor} mensajeVacio={configuracion.vacio} />}
      </div>
    </section>
  )
}

export default EstadisticasPage
