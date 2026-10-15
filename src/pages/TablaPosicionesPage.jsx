import { useParams } from 'react-router-dom'
import { useBeesoccStore } from '../stores/beesoccStore'
import { seleccionarTabla } from '../stores/selectores'

function diferenciaGol(valor) {
  return valor > 0 ? `+${valor}` : valor
}

function TablaPosicionesPage() {
  const equipos = useBeesoccStore((estado) => estado.equipos)
  const partidos = useBeesoccStore((estado) => estado.partidos)
  const eventos = useBeesoccStore((estado) => estado.eventos)
  const { ligaId } = useParams()
  // La clasificación siempre procede del estado actual; no guardamos otra tabla.
  const tabla = seleccionarTabla({ equipos, partidos, eventos }, ligaId)

  return (
    <section className="tabla-posiciones-page">
      <div className="modulo-header"><div><span className="etiqueta-superior">Clasificación</span><h2>Tabla de Posiciones</h2><p>Consulta la clasificación actual de la liga.</p></div></div>

      {tabla.length ? (
        <>
          <div className="tabla-responsive"><table className="tabla-deportiva"><thead><tr><th>Pos</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th></tr></thead><tbody>{tabla.map((fila, indice) => <tr key={fila.equipo_id}><td><span className="posicion-tabla">{indice + 1}</span></td><td><div className="equipo-tabla">{fila.escudo ? <img src={fila.escudo} alt="" /> : <span>+</span>}<strong>{fila.nombre}</strong></div></td><td>{fila.pj}</td><td>{fila.pg}</td><td>{fila.pe}</td><td>{fila.pp}</td><td>{fila.gf}</td><td>{fila.gc}</td><td>{diferenciaGol(fila.dg)}</td><td className="puntos-tabla">{fila.pts}</td></tr>)}</tbody></table></div>
          <p className="leyenda-tabla">PJ: Jugados · PG: Ganados · PE: Empatados · PP: Perdidos · GF: Goles a favor · GC: Goles en contra · DG: Diferencia · PTS: Puntos</p>
        </>
      ) : <div className="estado-vacio"><span>*</span><h2>La tabla de posiciones aún no tiene resultados</h2><p>Los partidos finalizados aparecerán reflejados aquí.</p></div>}
    </section>
  )
}

export default TablaPosicionesPage


