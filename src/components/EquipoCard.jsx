import { useState } from 'react'

function EscudoEquipo({ equipo }) {
  const [imagenValida, setImagenValida] = useState(Boolean(equipo.escudo))

  return (
    <div className="equipo-card__escudo">
      {imagenValida ? (
        <img
          src={equipo.escudo}
          alt={`Escudo de ${equipo.nombre}`}
          onError={() => setImagenValida(false)}
        />
      ) : (
        <span aria-hidden="true">+</span>
      )}
    </div>
  )
}

function EquipoCard({ equipo, onEditar, onEliminar, onVerJugadores }) {
  return (
    <article className="equipo-card">
      <EscudoEquipo key={equipo.escudo || 'sin-escudo'} equipo={equipo} />

      <h2>{equipo.nombre}</h2>
      <p>{equipo.ciudad || 'Ciudad no especificada'}</p>

      <div className="equipo-card__acciones">
        <button type="button" className="boton-texto" onClick={() => onVerJugadores(equipo)}>Ver jugadores</button>
        <button type="button" className="boton-texto" onClick={() => onEditar(equipo)}>Editar</button>
        <button type="button" className="boton-peligro" onClick={() => onEliminar(equipo)}>Eliminar</button>
      </div>
    </article>
  )
}

export default EquipoCard
