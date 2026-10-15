import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import EventoForm from '../components/EventoForm'
import EventoTimeline from '../components/EventoTimeline'
import { obtenerErrores } from '../services/errores'
import { useBeesoccStore } from '../stores/beesoccStore'
import { seleccionarEventos, seleccionarPartidos } from '../stores/selectores'
import { mismoId } from '../stores/utilidades'

function rol(equipo) {
  return equipo.rol_equipo || equipo.pivot?.rol_equipo
}

function goles(equipo) {
  return equipo?.goles_marcados ?? equipo?.pivot?.goles_marcados ?? 0
}

function nombrePartido(partido) {
  const local = partido.equipos.find((equipo) => rol(equipo) === 'local')
  const visitante = partido.equipos.find((equipo) => rol(equipo) === 'visitante')
  return `${local.nombre} vs ${visitante.nombre} — ${partido.estado === 'en_curso' ? 'En vivo' : partido.estado}`
}

function Escudo({ equipo }) {
  return equipo?.escudo ? <img src={equipo.escudo} alt={`Escudo de ${equipo.nombre}`} /> : <span aria-hidden="true">+</span>
}

function PartidoEnVivoPage() {
  const partidosGuardados = useBeesoccStore((estado) => estado.partidos)
  const equiposGuardados = useBeesoccStore((estado) => estado.equipos)
  const jugadoresGuardados = useBeesoccStore((estado) => estado.jugadores)
  const eventosGuardados = useBeesoccStore((estado) => estado.eventos)
  const { actualizarPartido } = useBeesoccStore((estado) => estado.accionesPartidos)
  const { crearEvento, actualizarEvento, eliminarEvento } = useBeesoccStore((estado) => estado.accionesEventos)
  const [eventoEditandoId, setEventoEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const { ligaId } = useParams()
  const [parametros, setParametros] = useSearchParams()
  const navegar = useNavigate()
  const partidoId = parametros.get('partido')
  const estado = { partidos: partidosGuardados, equipos: equiposGuardados, jugadores: jugadoresGuardados, eventos: eventosGuardados }
  const partidos = seleccionarPartidos(estado, ligaId).sort((a, b) => Number(b.estado === 'en_curso') - Number(a.estado === 'en_curso'))
  const partido = partidos.find((item) => mismoId(item.id, partidoId)) || null
  const eventos = partido ? seleccionarEventos(estado, partido.id) : []
  const eventoEditando = eventos.find((evento) => evento.id === eventoEditandoId) || null
  const local = partido?.equipos.find((equipo) => rol(equipo) === 'local')
  const visitante = partido?.equipos.find((equipo) => rol(equipo) === 'visitante')
  const erroresVisibles = partidoId && !partido ? ['El partido no existe en esta competición de ejemplo.'] : errores

  function seleccionarPartido(evento) {
    setEventoEditandoId(null)
    setErrores([])
    setParametros(evento.target.value ? { partido: evento.target.value } : {})
  }

  function setEventoEditando(evento) {
    setEventoEditandoId(evento?.id ?? null)
    setErrores([])
  }

  function guardarEvento(datos) {
    setGuardando(true)
    setErrores([])
    try {
      if (eventoEditando) actualizarEvento(eventoEditando.id, datos)
      else crearEvento(partido.id, datos)
      // Un solo cambio actualiza marcador, calendario, tabla y estadísticas.
      setEventoEditandoId(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  function borrarEvento(evento) {
    if (!window.confirm('¿Seguro que deseas eliminar este evento?')) return
    setErrores([])
    try {
      eliminarEvento(evento.id)
      setEventoEditandoId(null)
    } catch (error) { setErrores(obtenerErrores(error)) }
  }

  function cambiarEstado(estado) {
    setErrores([])
    try {
      actualizarPartido(partido.id, { ...partido, estado })
      setEventoEditandoId(null)
    } catch (error) { setErrores(obtenerErrores(error)) }
  }

  return (
    <section className="en-vivo-page">
      <button type="button" className="boton-volver" onClick={() => navegar(`/ligas/${ligaId}/partidos`)}>← Volver a Partidos</button>
      <div className="selector-partido"><label htmlFor="partido-en-vivo">Partido</label><select id="partido-en-vivo" value={partidoId || ''} onChange={seleccionarPartido}><option value="">Selecciona un partido</option>{partidos.map((item) => <option key={item.id} value={item.id}>{nombrePartido(item)}</option>)}</select></div>
      <ErroresFormulario mensajes={erroresVisibles} />

      {!partidoId && <p className="mensaje-estado">Selecciona un partido para consultar su desarrollo.</p>}

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

