import { buscarRegistro, guardarRegistro, mismoId, validar, validarCampos } from './utilidades'

export function crearAccionesJugadores(set, get) {
  function guardarJugador(equipoId, datos, id) {
    buscarRegistro(get(), 'equipos', equipoId)
    validarCampos(datos, ['nombre', 'apellido', 'posicion', 'dorsal'])
    validar(Number.isInteger(Number(datos.dorsal)) && Number(datos.dorsal) >= 0, 'El dorsal debe ser un entero mayor o igual a cero.')
    validar(['portero', 'defensa', 'mediocampista', 'delantero'].includes(datos.posicion), 'Selecciona una posición válida.')
    validar(!get().jugadores.some((jugador) => mismoId(jugador.equipo_id, equipoId) && !mismoId(jugador.id, id) && Number(jugador.dorsal) === Number(datos.dorsal)), 'El dorsal ya está siendo utilizado por otro jugador de este equipo.')
    return guardarRegistro(set, get, 'jugadores', {
      nombre: datos.nombre.trim(), apellido: datos.apellido.trim(), dorsal: Number(datos.dorsal),
      posicion: datos.posicion, fecha_nacido: datos.fecha_nacido || null, foto: datos.foto || null, equipo_id: Number(equipoId),
    }, id)
  }

  return {
    crearJugador: (equipoId, datos) => guardarJugador(equipoId, datos),
    actualizarJugador: (id, datos) => guardarJugador(buscarRegistro(get(), 'jugadores', id).equipo_id, datos, id),
    eliminarJugador: (id) => {
      buscarRegistro(get(), 'jugadores', id)
      // Se conserva el hecho deportivo aunque se retire el jugador del plantel.
      set((estado) => ({
        jugadores: estado.jugadores.filter((jugador) => !mismoId(jugador.id, id)),
        eventos: estado.eventos.map((evento) => mismoId(evento.jugador_id, id) ? { ...evento, jugador_id: null } : evento),
      }))
    },
  }
}
