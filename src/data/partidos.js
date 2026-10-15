import { competiciones } from './competiciones'

export const partidos = competiciones.flatMap((liga) => {
  const primero = (liga.id - 1) * 4 + 1
  return [[0, 1], [2, 3], [0, 2], [1, 3]].map(([local, visitante], indice) => ({
    id: (liga.id - 1) * 4 + indice + 1,
    liga_id: liga.id,
    jornada: indice < 2 ? 1 : 2,
    fecha: ['2026-10-10', '2026-10-11', '2026-10-15', '2026-10-18'][indice],
    hora: '16:00:00',
    estado: ['finalizado', 'finalizado', 'en_curso', 'pendiente'][indice],
    equipo_local_id: primero + local,
    equipo_visitante_id: primero + visitante,
  }))
})
