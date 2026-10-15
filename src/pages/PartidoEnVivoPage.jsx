import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import EventoForm from '../components/EventoForm'
import EventoTimeline from '../components/EventoTimeline'
import { actualizarEvento, crearEvento, eliminarEvento, obtenerEventos } from '../services/eventoService'
import { obtenerErrores } from '../services/errores'
import { actualizarPartido, obtenerPartido, obtenerPartidos } from '../services/partidoService'

function rol(equipo) {
  return equipo.rol_equipo || equipo.pivot?.rol_equipo
}

function goles(equipo) {
  return equipo?.goles_marcados ?? equipo?.pivot?.goles_marcados ?? 0
}

function datosCompletos(partido, estado) {
  const local = partido.equipos.find((equipo) => rol(equipo) === 'local')
  const visitante = partido.equipos.find((equipo) => rol(equipo) === 'visitante')
  return { jornada: partido.jornada, fecha: partido.fecha.slice(0, 10), hora: partido.hora.slice(0, 5), estado, equipo_local_id: local.id, equipo_visitante_id: visitante.id }
}

function nombrePartido(partido) {
  const local = partido.equipos?.find((equipo) => rol(equipo) === 'local')
  const visitante = partido.equipos?.find((equipo) => rol(equipo) === 'visitante')
  return `${local?.nombre || 'Local'} vs ${visitante?.nombre || 'Visitante'} — ${partido.estado === 'en_curso' ? 'En vivo' : partido.estado}`
}

function Escudo({ equipo }) {
  return equipo?.escudo ? <img src={equipo.escudo} alt={`Escudo de ${equipo.nombre}`} /> : <span aria-hidden="true">+</span>
}

function PartidoEnVivoPage() {
  const [partidos, setPartidos] = useState([])
  const [partido, setPartido] = useState(null)
  const [eventos, setEventos] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [cargandoPartido, setCargandoPartido] = useState(false)
  const [eventoEditando, setEventoEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const { ligaId } = useParams()
  const [parametros, setParametros] = useSearchParams()
  const partidoId = parametros.get('partido')
  const navegar = useNavigate()

  useEffect(() => {
    let activo = true

    async function cargarLista() {
      setPartidos([])
      setPartido(null)
      setEventos([])
      setCargandoLista(true)
      try {
        const respuesta = await obtenerPartidos(ligaId)
        if (activo) setPartidos([...respuesta.data.partidos].sort((a, b) => (b.estado === 'en_curso') - (a.estado === 'en_curso')))
      } catch {
        if (activo) setErrores(['No se pudieron cargar los partidos.'])
      } finally {
        if (activo) setCargandoLista(false)
      }
    }

    cargarLista()
    return () => { activo = false }
  }, [ligaId])

  useEffect(() => {
    let activo = true
    if (!partidoId) return undefined

    async function cargarPartido() {
      setPartido(null)
      setEventos([])
      setEventoEditando(null)
      setErrores([])
      setCargandoPartido(true)
      try {
        const [respuestaPartido, respuestaEventos] = await Promise.all([obtenerPartido(partidoId), obtenerEventos(partidoId)])
        if (!activo) return
        if (String(respuestaPartido.data.partido.liga_id) !== String(ligaId)) throw new Error('El partido no pertenece a esta competición de ejemplo.')
        setPartido(respuestaPartido.data.partido)
        setEventos(respuestaEventos.data.eventos)
      } catch (error) {
        if (activo) setErrores([obtenerErrores(error)[0]])
      } finally {
        if (activo) setCargandoPartido(false)
      }
    }

    cargarPartido()
    return () => { activo = false }
  }, [partidoId, ligaId])

  function seleccionarPartido(evento) {
    setPartido(null)
    setEventos([])
    setEventoEditando(null)
    setCargandoPartido(false)
    setErrores([])
    setParametros(evento.target.value ? { partido: evento.target.value } : {})
  }

  async function refrescarPartido() {
    const [respuestaPartido, respuestaEventos] = await Promise.all([obtenerPartido(partidoId), obtenerEventos(partidoId)])
    setPartido(respuestaPartido.data.partido)
    setEventos(respuestaEventos.data.eventos)
  }

  async function guardarEvento(datos) {
    setGuardando(true)
    setErrores([])
    try {
      if (eventoEditando) await actualizarEvento(eventoEditando.id, datos)
      else await crearEvento(partido.id, datos)
      await refrescarPartido()
      setEventoEditando(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  async function borrarEvento(evento) {
    if (!window.confirm('¿Seguro que deseas eliminar este evento?')) return
    setErrores([])
    try {
      await eliminarEvento(evento.id)
      await refrescarPartido()
    } catch (error) {
      setErrores(obtenerErrores(error))
    }
  }

  async function cambiarEstado(estado) {
    setErrores([])
    try {
      const respuesta = await actualizarPartido(partido.id, datosCompletos(partido, estado))
      setPartido(respuesta.data.partido)
      setEventoEditando(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    }
  }

  const local = partido?.equipos.find((equipo) => rol(equipo) === 'local')
  const visitante = partido?.equipos.find((equipo) => rol(equipo) === 'visitante')

  return (
    <section className="en-vivo-page">
      <button type="button" className="boton-volver" onClick={() => navegar(`/ligas/${ligaId}/partidos`)}>← Volver a Partidos</button>
      <div className="selector-partido"><label htmlFor="partido-en-vivo">Partido</label><select id="partido-en-vivo" value={partidoId || ''} onChange={seleccionarPartido} disabled={cargandoLista}><option value="">{cargandoLista ? 'Cargando partidos...' : 'Selecciona un partido'}</option>{partidos.map((item) => <option key={item.id} value={item.id}>{nombrePartido(item)}</option>)}</select></div>
      <ErroresFormulario mensajes={errores} />

      {!partidoId && !cargandoLista && <p className="mensaje-estado">Selecciona un partido para consultar su desarrollo.</p>}
      {partidoId && cargandoPartido && <p className="mensaje-estado">Cargando partido...</p>}

      {partidoId && partido && (
        <>
          <header className="marcador-vivo">
            <div className="marcador-vivo__meta"><span>Jornada {partido.jornada}</span><strong className={`badge-vivo badge-vivo--${partido.estado}`}>{partido.estado === 'en_curso' ? 'EN VIVO' : partido.estado === 'finalizado' ? 'FINALIZADO' : 'PENDIENTE'}</strong><span>{partido.fecha.slice(0, 10)} · {partido.hora.slice(0, 5)}</span></div>
            <div className="marcador-vivo__resultado"><div><Escudo equipo={local} /><h2>{local?.nombre}</h2></div><strong>{goles(local)} <small>-</small> {goles(visitante)}</strong><div><Escudo equipo={visitante} /><h2>{visitante?.nombre}</h2></div></div>
          </header>

          {partido.estado === 'pendiente' && <div className="estado-partido-panel"><p>Este partido todavía no ha iniciado.</p><button type="button" onClick={() => cambiarEstado('en_curso')}>Iniciar partido</button></div>}
          {partido.estado === 'en_curso' && <div className="accion-finalizar"><button type="button" className="boton-peligro-solido" onClick={() => cambiarEstado('finalizado')}>Finalizar partido</button></div>}
          {partido.estado === 'finalizado' && <div className="estado-partido-panel"><strong>Partido finalizado</strong></div>}

          <div className="en-vivo-contenido">
            {partido.estado === 'en_curso' && <EventoForm key={eventoEditando?.id || `nuevo-${eventos.length}`} eventoInicial={eventoEditando} equipos={[local, visitante]} onGuardar={guardarEvento} onCancelar={() => { setEventoEditando(null); setErrores([]) }} guardando={guardando} errores={errores} />}
            <section className="timeline-panel"><div className="seccion-titulo"><h2>Línea de tiempo</h2><p>Eventos registrados durante el encuentro.</p></div><EventoTimeline eventos={eventos} editable={partido.estado === 'en_curso'} onEditar={setEventoEditando} onEliminar={borrarEvento} /></section>
          </div>
        </>
      )}
    </section>
  )
}

export default PartidoEnVivoPage
