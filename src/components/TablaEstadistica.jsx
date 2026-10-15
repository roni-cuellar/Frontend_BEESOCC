function TablaEstadistica({ datos, campoValor, nombreValor, mensajeVacio }) {
  if (!datos.length) return <div className="estado-vacio estado-vacio--compacto"><span>+</span><p>{mensajeVacio}</p></div>

  return (
    <div className="tabla-responsive">
      <table className="tabla-deportiva tabla-estadistica">
        <thead><tr><th>Pos</th><th>Jugador</th><th>Equipo</th><th>{nombreValor}</th></tr></thead>
        <tbody>{datos.map((fila, indice) => <tr key={fila.jugador.id}><td><span className="posicion-tabla">{indice + 1}</span></td><td><strong>{fila.jugador.nombre} {fila.jugador.apellido}</strong></td><td>{fila.equipo?.nombre || 'Sin equipo'}</td><td className="valor-estadistica">{fila[campoValor]}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

export default TablaEstadistica
