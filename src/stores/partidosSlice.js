import { buscarRegistro, guardarRegistro, mismoId, validar, validarCampos } from './utilidades'

export function crearAccionesPartidos(set, get) {
  function guardarPartido(ligaId, datos, id) {
    buscarRegistro(get(), 'ligas', ligaId)
    validarCampos(datos, ['jornada', 'fecha', 'hora', 'estado', 'equipo_local_id', 'equipo_visitante_id'])
    validar(!mismoId(datos.equipo_local_id, datos.equipo_visitante_id), 'Los equipos deben ser diferentes.')
    for (const equipoId of [datos.equipo_local_id, datos.equipo_visitante_id]) validar(mismoId(buscarRegistro(get(), 'equipos', equipoId).liga_id, ligaId), 'Los equipos deben pertenecer a esta liga.')
    validar(Number.isInteger(Number(datos.jornada)) && Number(datos.jornada) > 0, 'La jornada debe ser un entero positivo.')
    validar(['pendiente', 'en_curso', 'finalizado'].includes(datos.estado), 'Selecciona un estado de partido válido.')
    const anterior = id == null ? null : buscarRegistro(get(), 'partidos', id)
    const cambioEquipos = anterior && (!mismoId(anterior.equipo_local_id, datos.equipo_local_id) || !mismoId(anterior.equipo_visitante_id, datos.equipo_visitante_id))
    validar(!cambioEquipos || !get().eventos.some((evento) => mismoId(evento.partido_id, id)), 'No se pueden cambiar los equipos de un partido con eventos registrados.')
    return guardarRegistro(set, get, 'partidos', {
      liga_id: Number(ligaId), jornada: Number(datos.jornada), fecha: datos.fecha, hora: datos.hora,
      estado: datos.estado, equipo_local_id: Number(datos.equipo_local_id), equipo_visitante_id: Number(datos.equipo_visitante_id),
    }, id)
  }

  return {
    crearPartido: (ligaId, datos) => guardarPartido(ligaId, datos),
    actualizarPartido: (id, datos) => guardarPartido(buscarRegistro(get(), 'partidos', id).liga_id, datos, id),
    eliminarPartido: (id) => {
      buscarRegistro(get(), 'partidos', id)
      set((estado) => ({
        partidos: estado.partidos.filter((partido) => !mismoId(partido.id, id)),
        eventos: estado.eventos.filter((evento) => !mismoId(evento.partido_id, id)),
      }))
    },
  }
}

export function crearAccionesEventos(set, get) {
  function guardarEvento(partidoId, datos, id) {
    const partido = buscarRegistro(get(), 'partidos', partidoId)
    validar(partido.estado === 'en_curso', 'Solo se pueden registrar o editar eventos en un partido en curso.')
    validarCampos(datos, ['tipo', 'equipo_id', 'minuto'])
    validar(['gol', 'asistencia', 'amarilla', 'roja', 'falta', 'autogol'].includes(datos.tipo), 'Selecciona un tipo de evento válido.')
    validar(Number.isInteger(Number(datos.minuto)) && Number(datos.minuto) >= 0, 'El minuto debe ser un entero mayor o igual a cero.')
    const participantes = [partido.equipo_local_id, partido.equipo_visitante_id]
    validar(participantes.includes(Number(datos.equipo_id)), 'El equipo debe participar en este partido.')
    if (datos.jugador_id) {
      const jugador = buscarRegistro(get(), 'jugadores', datos.jugador_id)
      const equipoEsperado = datos.tipo === 'autogol' ? participantes.find((equipoId) => !mismoId(equipoId, datos.equipo_id)) : datos.equipo_id
      validar(mismoId(jugador.equipo_id, equipoEsperado), 'Selecciona un jugador del equipo correspondiente.')
    }
    return guardarRegistro(set, get, 'eventos', {
      partido_id: Number(partidoId), equipo_id: Number(datos.equipo_id), jugador_id: datos.jugador_id ? Number(datos.jugador_id) : null,
      tipo: datos.tipo, minuto: Number(datos.minuto), descripcion: datos.descripcion || null,
    }, id)
  }

  return {
    crearEvento: (partidoId, datos) => guardarEvento(partidoId, datos),
    actualizarEvento: (id, datos) => guardarEvento(buscarRegistro(get(), 'eventos', id).partido_id, datos, id),
    eliminarEvento: (id) => {
      const evento = buscarRegistro(get(), 'eventos', id)
      validar(buscarRegistro(get(), 'partidos', evento.partido_id).estado === 'en_curso', 'Solo se pueden eliminar eventos de un partido en curso.')
      set((estado) => ({ eventos: estado.eventos.filter((item) => !mismoId(item.id, id)) }))
    },
  }
}
