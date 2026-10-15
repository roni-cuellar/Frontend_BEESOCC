import { buscarRegistro, datosLocales, guardarRegistro, mismoId, quitarRegistros, respuestaLocal, validar } from './datosLocales'

export async function obtenerEventos(partidoId) {
  buscarRegistro('partidos', partidoId)
  const eventos = datosLocales.eventos.filter((evento) => mismoId(evento.partido_id, partidoId)).sort((a, b) => a.minuto - b.minuto).map((evento) => ({
    ...evento,
    jugador: datosLocales.jugadores.find((jugador) => jugador.id === evento.jugador_id) || null,
    equipo: buscarRegistro('equipos', evento.equipo_id),
  }))
  return respuestaLocal({ eventos })
}

function guardarEvento(partidoId, datos, id) {
  const partido = buscarRegistro('partidos', partidoId)
  validar(partido.estado === 'en_curso', 'Solo se pueden registrar o editar eventos en un partido en curso.')
  validar(['gol', 'asistencia', 'amarilla', 'roja', 'falta', 'autogol'].includes(datos.tipo), 'Selecciona un tipo de evento válido.')
  validar(Number.isInteger(Number(datos.minuto)) && Number(datos.minuto) >= 0, 'El minuto debe ser un entero mayor o igual a cero.')
  const participantes = [partido.equipo_local_id, partido.equipo_visitante_id]
  validar(participantes.includes(Number(datos.equipo_id)), 'El equipo debe participar en este partido.')
  if (datos.jugador_id) {
    const jugador = buscarRegistro('jugadores', datos.jugador_id)
    const equipoEsperado = datos.tipo === 'autogol' ? participantes.find((equipoId) => !mismoId(equipoId, datos.equipo_id)) : datos.equipo_id
    validar(mismoId(jugador.equipo_id, equipoEsperado), 'Selecciona un jugador del equipo correspondiente.')
  }
  return respuestaLocal({ evento: guardarRegistro('eventos', { ...datos, partido_id: Number(partidoId), equipo_id: Number(datos.equipo_id), jugador_id: datos.jugador_id ? Number(datos.jugador_id) : null, minuto: Number(datos.minuto) }, id) })
}

export const crearEvento = async (partidoId, datos) => guardarEvento(partidoId, datos)
export const actualizarEvento = async (id, datos) => guardarEvento(buscarRegistro('eventos', id).partido_id, datos, id)
export async function eliminarEvento(id) {
  const evento = buscarRegistro('eventos', id)
  validar(buscarRegistro('partidos', evento.partido_id).estado === 'en_curso', 'Solo se pueden eliminar eventos de un partido en curso.')
  quitarRegistros('eventos', (item) => mismoId(item.id, id))
}
