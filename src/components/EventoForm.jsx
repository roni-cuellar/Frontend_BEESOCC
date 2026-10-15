import { useEffect, useState } from 'react'
import { obtenerJugadores } from '../services/jugadorService'
import ErroresFormulario from './ErroresFormulario'

function idEquipoJugadores(tipo, equipoId, equipos) {
  if (tipo !== 'autogol') return equipoId
  return equipos.find((equipo) => String(equipo.id) !== String(equipoId))?.id || ''
}

function EventoForm({ eventoInicial, equipos, onGuardar, onCancelar, guardando, errores }) {
  const [formulario, setFormulario] = useState({ tipo: eventoInicial?.tipo || 'gol', equipo_id: eventoInicial?.equipo_id || equipos[0]?.id || '', jugador_id: eventoInicial?.jugador_id || '', minuto: eventoInicial?.minuto ?? '', descripcion: eventoInicial?.descripcion || '' })
  const [jugadores, setJugadores] = useState([])
  const [cargandoJugadores, setCargandoJugadores] = useState(false)
  const equipoParaJugadores = idEquipoJugadores(formulario.tipo, formulario.equipo_id, equipos)

  useEffect(() => {
    let activo = true
    if (!equipoParaJugadores) return undefined

    async function cargarJugadores() {
      setJugadores([])
      setCargandoJugadores(true)
      try {
        const respuesta = await obtenerJugadores(equipoParaJugadores)
        if (activo) setJugadores(respuesta.data.jugadores)
      } catch {
        if (activo) setJugadores([])
      } finally {
        if (activo) setCargandoJugadores(false)
      }
    }

    cargarJugadores()
    return () => { activo = false }
  }, [equipoParaJugadores])

  function manejarCambio(evento) {
    const cambios = { [evento.target.name]: evento.target.value }
    if (evento.target.name === 'tipo' || evento.target.name === 'equipo_id') cambios.jugador_id = ''
    setFormulario({ ...formulario, ...cambios })
  }

  function manejarSubmit(evento) {
    evento.preventDefault()
    onGuardar({ equipo_id: Number(formulario.equipo_id), jugador_id: formulario.jugador_id ? Number(formulario.jugador_id) : null, tipo: formulario.tipo, minuto: Number(formulario.minuto), descripcion: formulario.descripcion || null })
  }

  return (
    <form className="evento-form" onSubmit={manejarSubmit}>
      <div className="evento-form__cabecera"><div><span className="etiqueta-superior">Evento</span><h3>{eventoInicial ? 'Editar evento' : 'Registrar evento'}</h3></div>{eventoInicial && <button type="button" className="boton-texto" onClick={onCancelar}>Cancelar edición</button>}</div>
      <ErroresFormulario mensajes={errores} />
      <label htmlFor="tipo-evento">Tipo de evento</label><select id="tipo-evento" name="tipo" value={formulario.tipo} onChange={manejarCambio}><option value="gol">Gol</option><option value="asistencia">Asistencia</option><option value="amarilla">Tarjeta amarilla</option><option value="roja">Tarjeta roja</option><option value="falta">Falta</option><option value="autogol">Autogol</option></select>
      <label htmlFor="equipo-evento">{formulario.tipo === 'autogol' ? 'Equipo beneficiado' : 'Equipo'}</label><select id="equipo-evento" name="equipo_id" value={formulario.equipo_id} onChange={manejarCambio} required>{equipos.map((equipo) => <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>)}</select>
      {formulario.tipo === 'autogol' && <p className="ayuda-campo">Selecciona el equipo beneficiado. Los jugadores mostrados pertenecen al rival.</p>}
      <label htmlFor="jugador-evento">Jugador</label><select id="jugador-evento" name="jugador_id" value={formulario.jugador_id} onChange={manejarCambio} disabled={cargandoJugadores}><option value="">{cargandoJugadores ? 'Cargando jugadores...' : 'Sin jugador'}</option>{jugadores.map((jugador) => <option key={jugador.id} value={jugador.id}>{jugador.nombre} {jugador.apellido}</option>)}</select>
      <label htmlFor="minuto-evento">Minuto</label><input id="minuto-evento" name="minuto" type="number" min="0" value={formulario.minuto} onChange={manejarCambio} required />
      <label htmlFor="descripcion-evento">Descripción</label><textarea id="descripcion-evento" name="descripcion" rows="3" value={formulario.descripcion} onChange={manejarCambio} placeholder="Descripción opcional" />
      <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : eventoInicial ? 'Actualizar evento' : 'Registrar evento'}</button>
    </form>
  )
}

export default EventoForm
