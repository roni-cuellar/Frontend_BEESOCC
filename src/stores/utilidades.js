export const mismoId = (primero, segundo) => String(primero) === String(segundo)

export function validar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje)
}

export function buscarRegistro(estado, coleccion, id) {
  const registro = estado[coleccion].find((item) => mismoId(item.id, id))
  validar(registro, 'No se encontró el registro en los datos de ejemplo.')
  return registro
}

export function validarCampos(datos, campos) {
  for (const campo of campos) validar(String(datos[campo] ?? '').trim(), `El campo ${campo.replaceAll('_', ' ')} es obligatorio.`)
  for (const campo of ['escudo', 'foto', 'imagen']) {
    if (datos[campo]) validar(/^\/(?!\/)/.test(datos[campo]) && !/[\\\s]/.test(datos[campo]), 'Utiliza una ruta local de imagen, por ejemplo /favic.svg.')
  }
}

export function guardarRegistro(set, get, coleccion, datos, id) {
  const actuales = get()[coleccion]
  const anterior = id == null ? null : buscarRegistro(get(), coleccion, id)
  // El ID se obtiene de los datos persistidos, sin un contador independiente.
  const registro = { ...anterior, ...datos, id: anterior?.id ?? Math.max(0, ...actuales.map((item) => item.id)) + 1 }
  set({ [coleccion]: anterior ? actuales.map((item) => item.id === anterior.id ? registro : item) : [...actuales, registro] })
  return registro
}

export function sinEquipos(estado, ids) {
  const partidosBorrados = estado.partidos.filter((partido) => ids.includes(partido.equipo_local_id) || ids.includes(partido.equipo_visitante_id)).map((partido) => partido.id)
  const jugadoresBorrados = estado.jugadores.filter((jugador) => ids.includes(jugador.equipo_id)).map((jugador) => jugador.id)
  // Una sola actualización elimina las referencias relacionadas y avisa a todas las páginas.
  return {
    equipos: estado.equipos.filter((equipo) => !ids.includes(equipo.id)),
    jugadores: estado.jugadores.filter((jugador) => !ids.includes(jugador.equipo_id)),
    partidos: estado.partidos.filter((partido) => !partidosBorrados.includes(partido.id)),
    eventos: estado.eventos.filter((evento) => !partidosBorrados.includes(evento.partido_id) && !ids.includes(evento.equipo_id)).map((evento) => jugadoresBorrados.includes(evento.jugador_id) ? { ...evento, jugador_id: null } : evento),
  }
}
