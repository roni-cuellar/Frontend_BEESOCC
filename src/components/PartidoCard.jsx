const nombresEstado = { pendiente: 'Pendiente', en_curso: 'En curso', finalizado: 'Finalizado' }

function obtenerParticipante(partido, rol) {
  return partido.equipos?.find((equipo) => (equipo.rol_equipo || equipo.pivot?.rol_equipo) === rol)
}

function formatearFecha(fecha) {
  if (!fecha) return 'Fecha pendiente'
  const [anio, mes, dia] = fecha.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

function formatearHora(hora) {
  if (!hora) return ''
  const [horas, minutos] = hora.split(':').map(Number)
  return `${horas % 12 || 12}:${String(minutos).padStart(2, '0')} ${horas >= 12 ? 'PM' : 'AM'}`
}

function goles(equipo) {
  return equipo?.goles_marcados ?? equipo?.pivot?.goles_marcados ?? 0
}

function PartidoCard({ partido, onEditar, onEliminar, onVer, onCambiarEstado }) {
  const local = obtenerParticipante(partido, 'local')
  const visitante = obtenerParticipante(partido, 'visitante')

  return (
    <article className="partido-card">
      <div className="partido-card__cabecera"><strong>Jornada {partido.jornada}</strong><span className={`estado-partido estado-partido--${partido.estado}`}>{nombresEstado[partido.estado]}</span></div>
      <div className="partido-card__marcador"><span>{local?.nombre || 'Equipo local'}</span><strong>{goles(local)} - {goles(visitante)}</strong><span>{visitante?.nombre || 'Equipo visitante'}</span></div>
      <p className="partido-card__fecha">{formatearFecha(partido.fecha)} · {formatearHora(partido.hora)}</p>
      <div className="partido-card__acciones"><button type="button" className="boton-texto" onClick={() => onVer(partido)}>Ver partido</button><button type="button" className="boton-texto" onClick={() => onEditar(partido)}>Editar</button><button type="button" className="boton-peligro" onClick={() => onEliminar(partido)}>Eliminar</button></div>
      {partido.estado === 'pendiente' && <button type="button" className="partido-card__estado" onClick={() => onCambiarEstado(partido, 'en_curso')}>Iniciar partido</button>}
      {partido.estado === 'en_curso' && <button type="button" className="partido-card__estado" onClick={() => onCambiarEstado(partido, 'finalizado')}>Finalizar</button>}
    </article>
  )
}

export default PartidoCard
