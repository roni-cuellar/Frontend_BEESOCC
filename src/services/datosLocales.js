import { competiciones } from '../data/competiciones'
import { equipos } from '../data/equipos'
import { jugadores } from '../data/jugadores'
import { partidos } from '../data/partidos'
import { eventos } from '../data/eventos'
import { noticias } from '../data/noticias'

// Una copia en memoria permite conservar las ediciones al navegar entre páginas.
// Cada página sigue usando useState; una recarga restaura los ejemplos originales.
export const datosLocales = structuredClone({ ligas: competiciones, equipos, jugadores, partidos, eventos, noticias })
let siguienteId = 1000

export const mismoId = (primero, segundo) => String(primero) === String(segundo)
export const respuestaLocal = (datos) => ({ data: structuredClone(datos) })

export function validar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje)
}

export function buscarRegistro(coleccion, id) {
  const registro = datosLocales[coleccion].find((item) => mismoId(item.id, id))
  validar(registro, 'No se encontró el registro en los datos de ejemplo.')
  return registro
}

export function validarCampos(datos, campos) {
  for (const campo of campos) validar(String(datos[campo] ?? '').trim(), `El campo ${campo.replaceAll('_', ' ')} es obligatorio.`)
  // Los formularios aceptan recursos del proyecto, nunca imágenes de servicios externos.
  for (const campo of ['escudo', 'foto', 'imagen']) {
    if (datos[campo]) validar(/^\/(?!\/)/.test(datos[campo]) && !/[\\\s]/.test(datos[campo]), 'Utiliza una ruta local de imagen, por ejemplo /favic.svg.')
  }
}

export function guardarRegistro(coleccion, datos, id) {
  if (id != null) {
    const registro = buscarRegistro(coleccion, id)
    Object.assign(registro, datos)
    return registro
  }
  const registro = { ...datos, id: siguienteId++ }
  datosLocales[coleccion].push(registro)
  return registro
}

export function quitarRegistros(coleccion, coincide) {
  datosLocales[coleccion] = datosLocales[coleccion].filter((item) => !coincide(item))
}

export function quitarPartido(id) {
  quitarRegistros('eventos', (evento) => mismoId(evento.partido_id, id))
  quitarRegistros('partidos', (partido) => mismoId(partido.id, id))
}

export function quitarEquipo(id) {
  datosLocales.partidos.filter((partido) => [partido.equipo_local_id, partido.equipo_visitante_id].some((equipoId) => mismoId(equipoId, id))).forEach((partido) => quitarPartido(partido.id))
  quitarRegistros('eventos', (evento) => mismoId(evento.equipo_id, id))
  const jugadoresBorrados = datosLocales.jugadores.filter((jugador) => mismoId(jugador.equipo_id, id)).map((jugador) => jugador.id)
  datosLocales.eventos.forEach((evento) => { if (jugadoresBorrados.includes(evento.jugador_id)) evento.jugador_id = null })
  quitarRegistros('jugadores', (jugador) => mismoId(jugador.equipo_id, id))
  quitarRegistros('equipos', (equipo) => mismoId(equipo.id, id))
}
