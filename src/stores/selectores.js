import { calcularEquipos, calcularJugadores, calcularTabla } from '../data/estadisticas'
import { mismoId } from './utilidades'

export function seleccionarEquipos(estado, ligaId) {
  return estado.equipos.filter((equipo) => mismoId(equipo.liga_id, ligaId))
}

export function completarPartido(partido, equipos, eventos) {
  const goles = (equipoId) => eventos.filter((evento) => evento.partido_id === partido.id && evento.equipo_id === equipoId && ['gol', 'autogol'].includes(evento.tipo)).length
  // Los nombres y marcadores se calculan: no hay copias de equipos dentro de los partidos.
  return { ...partido, equipos: [
    { ...equipos.find((equipo) => equipo.id === partido.equipo_local_id), rol_equipo: 'local', goles_marcados: goles(partido.equipo_local_id) },
    { ...equipos.find((equipo) => equipo.id === partido.equipo_visitante_id), rol_equipo: 'visitante', goles_marcados: goles(partido.equipo_visitante_id) },
  ] }
}

export function seleccionarPartidos(estado, ligaId) {
  return estado.partidos.filter((partido) => mismoId(partido.liga_id, ligaId)).map((partido) => completarPartido(partido, estado.equipos, estado.eventos))
}

export function seleccionarEventos(estado, partidoId) {
  return estado.eventos.filter((evento) => mismoId(evento.partido_id, partidoId)).sort((a, b) => a.minuto - b.minuto).map((evento) => ({
    ...evento, jugador: estado.jugadores.find((jugador) => jugador.id === evento.jugador_id) || null,
    equipo: estado.equipos.find((equipo) => equipo.id === evento.equipo_id),
  }))
}

export function seleccionarTabla(estado, ligaId) {
  return calcularTabla(seleccionarEquipos(estado, ligaId), estado.partidos.filter((partido) => mismoId(partido.liga_id, ligaId)), estado.eventos)
}

export function seleccionarEstadistica(estado, ligaId, categoria) {
  const equipos = seleccionarEquipos(estado, ligaId)
  const ids = equipos.map((equipo) => equipo.id)
  const eventos = estado.eventos.filter((evento) => ids.includes(evento.equipo_id))
  const jugadores = estado.jugadores.filter((jugador) => ids.includes(jugador.equipo_id))
  if (categoria === 'equipos') return calcularEquipos(equipos, eventos)
  const categorias = { goleadores: ['gol', 'goles'], asistencias: ['asistencia', 'asistencias'], amarillas: ['amarilla', 'amarillas'], rojas: ['roja', 'rojas'], faltas: ['falta', 'faltas'] }
  return calcularJugadores(jugadores, equipos, eventos, ...categorias[categoria])
}
