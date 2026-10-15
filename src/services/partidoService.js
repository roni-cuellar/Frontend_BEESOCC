import { buscarRegistro, datosLocales, guardarRegistro, mismoId, quitarPartido, respuestaLocal, validar, validarCampos } from './datosLocales'

// Reconstruimos los participantes con sus nombres actuales y goles de los eventos.
export function completarPartido(partido) {
  const goles = (equipoId) => datosLocales.eventos.filter((evento) => evento.partido_id === partido.id && evento.equipo_id === equipoId && ['gol', 'autogol'].includes(evento.tipo)).length
  return { ...partido, equipos: [
    { ...buscarRegistro('equipos', partido.equipo_local_id), rol_equipo: 'local', goles_marcados: goles(partido.equipo_local_id) },
    { ...buscarRegistro('equipos', partido.equipo_visitante_id), rol_equipo: 'visitante', goles_marcados: goles(partido.equipo_visitante_id) },
  ] }
}

export async function obtenerPartidos(ligaId) {
  buscarRegistro('ligas', ligaId)
  return respuestaLocal({ partidos: datosLocales.partidos.filter((partido) => mismoId(partido.liga_id, ligaId)).map(completarPartido) })
}
export const obtenerPartido = async (id) => respuestaLocal({ partido: completarPartido(buscarRegistro('partidos', id)) })

function guardarPartido(ligaId, datos, id) {
  validarCampos(datos, ['jornada', 'fecha', 'hora', 'estado', 'equipo_local_id', 'equipo_visitante_id'])
  validar(!mismoId(datos.equipo_local_id, datos.equipo_visitante_id), 'Los equipos deben ser diferentes.')
  for (const equipoId of [datos.equipo_local_id, datos.equipo_visitante_id]) validar(mismoId(buscarRegistro('equipos', equipoId).liga_id, ligaId), 'Los equipos deben pertenecer a esta liga.')
  validar(Number.isInteger(Number(datos.jornada)) && Number(datos.jornada) > 0, 'La jornada debe ser un entero positivo.')
  validar(['pendiente', 'en_curso', 'finalizado'].includes(datos.estado), 'Selecciona un estado de partido válido.')
  const partido = guardarRegistro('partidos', { ...datos, liga_id: Number(ligaId), equipo_local_id: Number(datos.equipo_local_id), equipo_visitante_id: Number(datos.equipo_visitante_id) }, id)
  return respuestaLocal({ partido: completarPartido(partido) })
}

export async function crearPartido(ligaId, datos) {
  buscarRegistro('ligas', ligaId)
  return guardarPartido(ligaId, datos)
}
export const actualizarPartido = async (id, datos) => guardarPartido(buscarRegistro('partidos', id).liga_id, datos, id)
export async function eliminarPartido(id) {
  buscarRegistro('partidos', id)
  quitarPartido(id)
}
