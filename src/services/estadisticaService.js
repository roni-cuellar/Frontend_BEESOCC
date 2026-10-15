import { calcularEquipos, calcularJugadores } from '../data/estadisticas'
import { buscarRegistro, datosLocales, mismoId, respuestaLocal } from './datosLocales'

function datosLiga(ligaId) {
  buscarRegistro('ligas', ligaId)
  const equipos = datosLocales.equipos.filter((equipo) => mismoId(equipo.liga_id, ligaId))
  const ids = equipos.map((equipo) => equipo.id)
  return { equipos, jugadores: datosLocales.jugadores.filter((jugador) => ids.includes(jugador.equipo_id)), eventos: datosLocales.eventos.filter((evento) => ids.includes(evento.equipo_id)) }
}
function obtenerCategoria(ligaId, tipo, campo) {
  const { jugadores, equipos, eventos } = datosLiga(ligaId)
  return respuestaLocal({ [campo]: calcularJugadores(jugadores, equipos, eventos, tipo, campo) })
}
export const obtenerGoleadores = async (ligaId) => obtenerCategoria(ligaId, 'gol', 'goles')
export const obtenerAsistencias = async (ligaId) => obtenerCategoria(ligaId, 'asistencia', 'asistencias')
export const obtenerAmarillas = async (ligaId) => obtenerCategoria(ligaId, 'amarilla', 'amarillas')
export const obtenerRojas = async (ligaId) => obtenerCategoria(ligaId, 'roja', 'rojas')
export const obtenerFaltas = async (ligaId) => obtenerCategoria(ligaId, 'falta', 'faltas')
export async function obtenerEstadisticasEquipos(ligaId) {
  const { equipos, eventos } = datosLiga(ligaId)
  return respuestaLocal({ equipos: calcularEquipos(equipos, eventos) })
}
