// La clasificación se deriva de los partidos finalizados y sus eventos locales.
export function calcularTabla(equipos, partidos, eventos) {
  const filas = equipos.map((equipo) => ({ equipo_id: equipo.id, nombre: equipo.nombre, escudo: equipo.escudo, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 }))
  for (const partido of partidos.filter((item) => item.estado === 'finalizado')) {
    const local = filas.find((fila) => fila.equipo_id === partido.equipo_local_id)
    const visitante = filas.find((fila) => fila.equipo_id === partido.equipo_visitante_id)
    if (!local || !visitante) continue
    const goles = (equipoId) => eventos.filter((evento) => evento.partido_id === partido.id && evento.equipo_id === equipoId && ['gol', 'autogol'].includes(evento.tipo)).length
    const golesLocal = goles(local.equipo_id)
    const golesVisitante = goles(visitante.equipo_id)
    for (const [fila, favor, contra] of [[local, golesLocal, golesVisitante], [visitante, golesVisitante, golesLocal]]) {
      fila.pj += 1
      fila.gf += favor
      fila.gc += contra
      fila.pg += Number(favor > contra)
      fila.pe += Number(favor === contra)
      fila.pp += Number(favor < contra)
      fila.dg = fila.gf - fila.gc
      fila.pts = fila.pg * 3 + fila.pe
    }
  }
  return filas.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.nombre.localeCompare(b.nombre))
}

export function calcularJugadores(jugadores, equipos, eventos, tipo, campo) {
  return jugadores.map((jugador) => ({
    jugador,
    equipo: equipos.find((equipo) => equipo.id === jugador.equipo_id),
    [campo]: eventos.filter((evento) => evento.jugador_id === jugador.id && evento.tipo === tipo).length,
  })).filter((fila) => fila[campo] > 0).sort((a, b) => b[campo] - a[campo])
}

export function calcularEquipos(equipos, eventos) {
  return equipos.map((equipo) => {
    const contar = (...tipos) => eventos.filter((evento) => evento.equipo_id === equipo.id && tipos.includes(evento.tipo)).length
    return { equipo_id: equipo.id, nombre: equipo.nombre, goles: contar('gol', 'autogol'), amarillas: contar('amarilla'), rojas: contar('roja'), faltas: contar('falta') }
  })
}
