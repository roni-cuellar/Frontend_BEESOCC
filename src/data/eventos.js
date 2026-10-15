import { partidos } from './partidos'

export const eventos = partidos.filter((partido) => partido.estado !== 'pendiente').flatMap((partido) => {
  const local = partido.equipo_local_id
  const visitante = partido.equipo_visitante_id
  const acciones = [
    ['gol', local, 12, 4],
    ['asistencia', local, 12, 3],
    ['amarilla', visitante, 24, 2],
    ['gol', visitante, 32, 4],
    ['falta', local, 38, 2],
    ['roja', visitante, 44, 2],
  ]
  if (partido.id % 4 === 1) acciones.push(['gol', local, 67, 4])
  return acciones.map(([tipo, equipoId, minuto, dorsalIndice], indice) => ({
    id: partido.id * 10 + indice,
    partido_id: partido.id,
    equipo_id: equipoId,
    jugador_id: (equipoId - 1) * 4 + dorsalIndice,
    tipo,
    minuto,
    descripcion: 'Evento ficticio de demostración.',
  }))
})
