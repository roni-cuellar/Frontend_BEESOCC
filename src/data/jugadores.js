import { equipos } from './equipos'

// Nombres inventados para la demostración; ningún registro representa a una persona real.
export const jugadores = equipos.flatMap((equipo) => (
  ['portero', 'defensa', 'mediocampista', 'delantero'].map((posicion, indice) => ({
    id: (equipo.id - 1) * 4 + indice + 1,
    equipo_id: equipo.id,
    nombre: ['Roni', 'Santiago', 'Jorge', 'Eduardo'][indice],
    apellido: ['Cuellar', 'Gomez', 'Alzate', '4KT'][equipo.id % 4],
    dorsal: [1, 4, 8, 9][indice],
    posicion,
    fecha_nacido: null,
    foto: null,
  }))
))
