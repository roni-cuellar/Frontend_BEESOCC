function LigaCard({ liga, onAdministrar, onEditar, onEliminar }) {
  return (
    <article className="liga-card">
      <div className="liga-card-cabecera">
        <span className={`estado-liga estado-${liga.estado}`}>{liga.estado}</span>
        <span className="temporada">Temporada {liga.temporada}</span>
      </div>

      <h2>{liga.nombre}</h2>
      <p>{liga.descripcion || 'Sin descripción.'}</p>

      <div className="liga-card-acciones">
        <button type="button" className="boton-texto" onClick={() => onEditar(liga)}>Editar</button>
        <button type="button" className="boton-peligro" onClick={() => onEliminar(liga)}>Eliminar</button>
        <button type="button" className="boton-administrar" onClick={() => onAdministrar(liga)}>Administrar →</button>
      </div>
    </article>
  )
}

export default LigaCard
