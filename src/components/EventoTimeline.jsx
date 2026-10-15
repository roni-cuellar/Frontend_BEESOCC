const tiposEvento = {
  gol: ['+', 'Gol'],
  asistencia: ['-', 'Asistencia'],
  amarilla: ['/', 'Tarjeta amarilla'],
  roja: ['/', 'Tarjeta roja'],
  falta: ['⚠', 'Falta'],
  autogol: ['↩', 'Autogol'],
}

function EventoTimeline({ eventos, editable, onEditar, onEliminar }) {
  if (!eventos.length) return <div className="timeline-vacio">Todavía no se han registrado eventos.</div>

  return (
    <div className="evento-timeline">
      {eventos.map((evento) => {
        const [icono, nombre] = tiposEvento[evento.tipo] || ['•', evento.tipo]
        return (
          <article key={evento.id} className={`evento-card evento-card--${evento.tipo}`}>
            <span className="evento-card__minuto">{evento.minuto}&apos;</span>
            <div className="evento-card__contenido">
              <strong>{icono} {nombre}</strong>
              <p>{evento.jugador ? `${evento.jugador.nombre} ${evento.jugador.apellido}` : 'Sin jugador'}</p>
              <small>{evento.equipo?.nombre || 'Equipo'}{evento.descripcion ? ` · ${evento.descripcion}` : ''}</small>
            </div>
            {editable && <div className="evento-card__acciones"><button type="button" className="boton-texto" onClick={() => onEditar(evento)}>Editar</button><button type="button" className="boton-peligro" onClick={() => onEliminar(evento)}>Eliminar</button></div>}
          </article>
        )
      })}
    </div>
  )
}

export default EventoTimeline
