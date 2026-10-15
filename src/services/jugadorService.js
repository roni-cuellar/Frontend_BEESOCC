import { buscarRegistro, datosLocales, guardarRegistro, mismoId, quitarRegistros, respuestaLocal, validar, validarCampos } from './datosLocales'

export async function obtenerJugadores(equipoId) {
  buscarRegistro('equipos', equipoId)
  return respuestaLocal({ jugadores: datosLocales.jugadores.filter((jugador) => mismoId(jugador.equipo_id, equipoId)) })
}
export const obtenerJugador = async (id) => respuestaLocal({ jugador: buscarRegistro('jugadores', id) })

function guardarJugador(equipoId, datos, id) {
  validarCampos(datos, ['nombre', 'apellido', 'posicion', 'dorsal'])
  validar(Number.isInteger(Number(datos.dorsal)) && Number(datos.dorsal) >= 0, 'El dorsal debe ser un entero mayor o igual a cero.')
  validar(!datosLocales.jugadores.some((jugador) => mismoId(jugador.equipo_id, equipoId) && !mismoId(jugador.id, id) && Number(jugador.dorsal) === Number(datos.dorsal)), 'El dorsal ya está siendo utilizado por otro jugador de este equipo.')
  return respuestaLocal({ jugador: guardarRegistro('jugadores', { ...datos, equipo_id: Number(equipoId) }, id) })
}

export async function crearJugador(equipoId, datos) {
  buscarRegistro('equipos', equipoId)
  return guardarJugador(equipoId, datos)
}
export const actualizarJugador = async (id, datos) => guardarJugador(buscarRegistro('jugadores', id).equipo_id, datos, id)
export async function eliminarJugador(id) {
  buscarRegistro('jugadores', id)
  // Conservamos el evento deportivo aunque su jugador deje de estar en el plantel.
  datosLocales.eventos.forEach((evento) => { if (mismoId(evento.jugador_id, id)) evento.jugador_id = null })
  quitarRegistros('jugadores', (jugador) => mismoId(jugador.id, id))
}
