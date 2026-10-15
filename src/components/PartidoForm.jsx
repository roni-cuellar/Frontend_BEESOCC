import { useState } from 'react'
import ErroresFormulario from './ErroresFormulario'

function obtenerParticipante(partido, rol) {
  return partido.equipos?.find((equipo) => (equipo.rol_equipo || equipo.pivot?.rol_equipo) === rol)
}

function PartidoForm({ partidoInicial, equipos, onGuardar, onCancelar, guardando, errores }) {
  const localInicial = partidoInicial ? obtenerParticipante(partidoInicial, 'local') : null
  const visitanteInicial = partidoInicial ? obtenerParticipante(partidoInicial, 'visitante') : null
  const [formulario, setFormulario] = useState({ jornada: partidoInicial?.jornada || '', fecha: partidoInicial?.fecha?.slice(0, 10) || '', hora: partidoInicial?.hora?.slice(0, 5) || '', equipo_local_id: localInicial?.id || '', equipo_visitante_id: visitanteInicial?.id || '', estado: partidoInicial?.estado || 'pendiente' })

  function manejarCambio(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  function manejarSubmit(evento) {
    evento.preventDefault()
    if (formulario.equipo_local_id === formulario.equipo_visitante_id) return
    onGuardar({ ...formulario, jornada: Number(formulario.jornada), equipo_local_id: Number(formulario.equipo_local_id), equipo_visitante_id: Number(formulario.equipo_visitante_id) })
  }

  return (
    <div className="formulario-fondo" role="presentation">
      <section className="formulario-liga" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario-partido">
        <div className="formulario-cabecera"><div><span className="etiqueta-superior">Partido</span><h2 id="titulo-formulario-partido">{partidoInicial ? 'Editar partido' : 'Nuevo partido'}</h2></div><button type="button" className="cerrar-formulario" onClick={onCancelar} aria-label="Cerrar">×</button></div>
        <ErroresFormulario mensajes={errores} />
        <form onSubmit={manejarSubmit}>
          <div className="campos-dobles"><div><label htmlFor="jornada-partido">Jornada</label><input id="jornada-partido" name="jornada" type="number" min="1" value={formulario.jornada} onChange={manejarCambio} required /></div><div><label htmlFor="estado-partido">Estado</label><select id="estado-partido" name="estado" value={formulario.estado} onChange={manejarCambio}><option value="pendiente">Pendiente</option><option value="en_curso">En curso</option><option value="finalizado">Finalizado</option></select></div></div>
          <div className="campos-dobles"><div><label htmlFor="fecha-partido">Fecha</label><input id="fecha-partido" name="fecha" type="date" value={formulario.fecha} onChange={manejarCambio} required /></div><div><label htmlFor="hora-partido">Hora</label><input id="hora-partido" name="hora" type="time" value={formulario.hora} onChange={manejarCambio} required /></div></div>
          <label htmlFor="local-partido">Equipo local</label><select id="local-partido" name="equipo_local_id" value={formulario.equipo_local_id} onChange={manejarCambio} required><option value="">Escoge el equipo local</option>{equipos.map((equipo) => <option key={equipo.id} value={equipo.id} disabled={String(equipo.id) === String(formulario.equipo_visitante_id)}>{equipo.nombre}</option>)}</select>
          <label htmlFor="visitante-partido">Equipo visitante</label><select id="visitante-partido" name="equipo_visitante_id" value={formulario.equipo_visitante_id} onChange={manejarCambio} required><option value="">Escoge el equipo visitante</option>{equipos.map((equipo) => <option key={equipo.id} value={equipo.id} disabled={String(equipo.id) === String(formulario.equipo_local_id)}>{equipo.nombre}</option>)}</select>
          <div className="formulario-acciones"><button type="button" className="boton-cancelar" onClick={onCancelar}>Cancelar</button><button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar partido'}</button></div>
        </form>
      </section>
    </div>
  )
}

export default PartidoForm
