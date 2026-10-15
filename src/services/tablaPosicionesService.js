import { calcularTabla } from '../data/estadisticas'
import { buscarRegistro, datosLocales, mismoId, respuestaLocal } from './datosLocales'

export async function obtenerTablaPosiciones(ligaId) {
  buscarRegistro('ligas', ligaId)
  return respuestaLocal({ tabla: calcularTabla(
    datosLocales.equipos.filter((equipo) => mismoId(equipo.liga_id, ligaId)),
    datosLocales.partidos.filter((partido) => mismoId(partido.liga_id, ligaId)),
    datosLocales.eventos,
  ) })
}
