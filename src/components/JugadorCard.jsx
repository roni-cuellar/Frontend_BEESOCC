import { useState } from 'react'

const nombresPosicion = {
  portero: 'Portero',
  defensa: 'Defensa',
  mediocampista: 'Mediocampista',
  delantero: 'Delantero',
}

function FotoJugador({ jugador }) {
  const [imagenValida, setImagenValida] = useState(Boolean(jugador.foto))

  return (
    <div className="jugador-card__foto">
      {imagenValida ? (
        <img src={jugador.foto} alt={`Foto de ${jugador.nombre} ${jugador.apellido}`} onError={() => setImagenValida(false)} />
      ) : (
        <span aria-hidden="true">+</span>
      )}
    </div>
  )
}

function formatearFecha(fecha) {
  if (!fecha) return null
  const [anio, mes, dia] = fecha.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

function JugadorCard({ jugador, onEditar, onEliminar }) {
  return (
    <article className="jugador-card">
      <FotoJugador key={jugador.foto || 'sin-foto'} jugador={jugador} />
      <span className="jugador-card__dorsal">#{jugador.dorsal}</span>
      <h2>{jugador.nombre} {jugador.apellido}</h2>
      <p className="jugador-card__posicion">{nombresPosicion[jugador.posicion] || jugador.posicion}</p>
      {jugador.fecha_nacido && <p className="jugador-card__fecha">Nacimiento: {formatearFecha(jugador.fecha_nacido)}</p>}

      <div className="jugador-card__acciones">
        <button type="button" className="boton-texto" onClick={() => onEditar(jugador)}>Editar</button>
        <button type="button" className="boton-peligro" onClick={() => onEliminar(jugador)}>Eliminar</button>
      </div>
    </article>
  )
}

export default JugadorCard
