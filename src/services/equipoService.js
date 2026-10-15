import { buscarRegistro, datosLocales, guardarRegistro, mismoId, quitarEquipo, respuestaLocal, validarCampos } from './datosLocales'

export async function obtenerEquipos(ligaId) {
  buscarRegistro('ligas', ligaId)
  return respuestaLocal({ equipos: datosLocales.equipos.filter((equipo) => mismoId(equipo.liga_id, ligaId)) })
}
export const obtenerEquipo = async (id) => respuestaLocal({ equipo: buscarRegistro('equipos', id) })
export async function crearEquipo(ligaId, datos) {
  buscarRegistro('ligas', ligaId)
  validarCampos(datos, ['nombre'])
  return respuestaLocal({ equipo: guardarRegistro('equipos', { ...datos, liga_id: Number(ligaId) }) })
}
export async function actualizarEquipo(id, datos) {
  validarCampos(datos, ['nombre'])
  return respuestaLocal({ equipo: guardarRegistro('equipos', datos, id) })
}
export async function eliminarEquipo(id) {
  buscarRegistro('equipos', id)
  quitarEquipo(id)
}
