import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import PartidoCard from '../components/PartidoCard'
import PartidoForm from '../components/PartidoForm'
import { obtenerEquipos } from '../services/equipoService'
import { obtenerErrores } from '../services/errores'
import { actualizarPartido, crearPartido, eliminarPartido, obtenerPartidos } from '../services/partidoService'

function obtenerParticipante(partido, rol) {
  return partido.equipos?.find((equipo) => (equipo.rol_equipo || equipo.pivot?.rol_equipo) === rol)
}

function datosCompletos(partido, estado = partido.estado) {
  return {
    jornada: partido.jornada,
    fecha: partido.fecha.slice(0, 10),
    hora: partido.hora.slice(0, 5),
    estado,
    equipo_local_id: obtenerParticipante(partido, 'local').id,
    equipo_visitante_id: obtenerParticipante(partido, 'visitante').id,
  }
}

function PartidosPage() {
  const [partidos, setPartidos] = useState([])
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [partidoEditando, setPartidoEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const { ligaId } = useParams()
  const navegar = useNavigate()

  useEffect(() => {
    let activo = true

    async function cargarDatos() {
      setCargando(true)
      setPartidos([])
      setEquipos([])
      setErrores([])
      try {
        // Cargamos partidos y equipos de la liga al mismo tiempo.
        const [respuestaPartidos, respuestaEquipos] = await Promise.all([obtenerPartidos(ligaId), obtenerEquipos(ligaId)])
        if (!activo) return
        setPartidos(respuestaPartidos.data.partidos)
        setEquipos(respuestaEquipos.data.equipos)
      } catch (error) {
        if (activo) setErrores([obtenerErrores(error)[0]])
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarDatos()
    return () => { activo = false }
  }, [ligaId])

  const partidosFiltrados = useMemo(() => filtro === 'todos' ? partidos : partidos.filter((partido) => partido.estado === filtro), [filtro, partidos])

  function abrirCreacion() {
    if (equipos.length < 2) return
    setPartidoEditando(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(partido) {
    setPartidoEditando(partido)
    setErrores([])
    setMostrarFormulario(true)
  }

  async function guardarPartido(datos) {
    if (datos.equipo_local_id === datos.equipo_visitante_id) {
      setErrores(['Los equipos deben ser diferentes.'])
      return
    }
    setGuardando(true)
    setErrores([])
    try {
      if (partidoEditando) {
        const respuesta = await actualizarPartido(partidoEditando.id, datos)
        setPartidos((actuales) => actuales.map((partido) => partido.id === partidoEditando.id ? respuesta.data.partido : partido))
      } else {
        const respuesta = await crearPartido(ligaId, datos)
        setPartidos((actuales) => [...actuales, respuesta.data.partido])
      }
      setMostrarFormulario(false)
      setPartidoEditando(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  async function borrarPartido(partido) {
    if (!window.confirm('¿Seguro que deseas eliminar este partido?')) return
    setErrores([])
    try {
      await eliminarPartido(partido.id)
      setPartidos((actuales) => actuales.filter((item) => item.id !== partido.id))
    } catch (error) {
      setErrores([obtenerErrores(error)[0]])
    }
  }

  async function cambiarEstado(partido, estado) {
    setErrores([])
    try {
      // Reutilizamos los datos del partido para actualizar su estado en memoria.
      const respuesta = await actualizarPartido(partido.id, datosCompletos(partido, estado))
      setPartidos((actuales) => actuales.map((item) => item.id === partido.id ? respuesta.data.partido : item))
    } catch (error) {
      setErrores(obtenerErrores(error))
    }
  }

  if (cargando) return <p className="mensaje-estado">Cargando partidos...</p>

  return (
    <section className="partidos-page">
      <div className="modulo-header"><div><span className="etiqueta-superior">Calendario</span><h2>Partidos</h2><p>Programa y administra los partidos de esta liga.</p></div><button type="button" onClick={abrirCreacion} disabled={equipos.length < 2}>+ Nuevo Partido</button></div>
      <ErroresFormulario mensajes={mostrarFormulario ? [] : errores} />
      {equipos.length < 2 && <div className="aviso-equipos"><p>Necesitas al menos dos equipos para crear un partido.</p><button type="button" onClick={() => navegar(`/ligas/${ligaId}/equipos`)}>Ir a Equipos</button></div>}
      {partidos.length > 0 && <div className="filtro-partidos"><label htmlFor="filtro-partidos">Mostrar</label><select id="filtro-partidos" value={filtro} onChange={(evento) => setFiltro(evento.target.value)}><option value="todos">Todos</option><option value="pendiente">Pendientes</option><option value="en_curso">En curso</option><option value="finalizado">Finalizados</option></select></div>}
      {!partidos.length ? (
        <div className="estado-vacio"><span>+</span><h2>Todavía no hay partidos programados</h2><p>Crea el primer partido de la liga.</p>{equipos.length >= 2 && <button type="button" onClick={abrirCreacion}>Crear Partido</button>}</div>
      ) : partidosFiltrados.length ? (
        <div className="partidos-grid">{partidosFiltrados.map((partido) => <PartidoCard key={partido.id} partido={partido} onEditar={abrirEdicion} onEliminar={borrarPartido} onCambiarEstado={cambiarEstado} onVer={(item) => navegar(`/ligas/${ligaId}/en-vivo?partido=${item.id}`)} />)}</div>
      ) : <p className="mensaje-estado">No hay partidos con este estado.</p>}
      {mostrarFormulario && <PartidoForm key={partidoEditando?.id || 'nuevo'} partidoInicial={partidoEditando} equipos={equipos} onGuardar={guardarPartido} onCancelar={() => { setMostrarFormulario(false); setErrores([]) }} guardando={guardando} errores={errores} />}
    </section>
  )
}

export default PartidosPage
