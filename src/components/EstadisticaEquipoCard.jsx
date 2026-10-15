function EstadisticaEquipoCard({ equipo }) {
  return (
    <article className="estadistica-equipo-card">
      <h3>{equipo.nombre}</h3>
      <div>
        <span><strong>{equipo.goles}</strong> Goles</span>
        <span><strong>{equipo.amarillas}</strong> Amarillas</span>
        <span><strong>{equipo.rojas}</strong> Rojas</span>
        <span><strong>{equipo.faltas}</strong> Faltas</span>
      </div>
    </article>
  )
}

export default EstadisticaEquipoCard
