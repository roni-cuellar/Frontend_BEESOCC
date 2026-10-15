import { buscarRegistro, datosLocales, guardarRegistro, mismoId, quitarEquipo, quitarRegistros, respuestaLocal, validarCampos } from './datosLocales'

export const obtenerLigas = async () => respuestaLocal({ ligas: datosLocales.ligas })
export const obtenerLiga = async (id) => respuestaLocal({ liga: buscarRegistro('ligas', id) })

function guardarLiga(datos, id) {
  validarCampos(datos, ['nombre', 'temporada', 'estado'])
  return respuestaLocal({ liga: guardarRegistro('ligas', datos, id) })
}

export const crearLiga = async (datos) => guardarLiga(datos)
export const actualizarLiga = async (id, datos) => guardarLiga(datos, id)
export async function eliminarLiga(id) {
  buscarRegistro('ligas', id)
  datosLocales.equipos.filter((equipo) => mismoId(equipo.liga_id, id)).forEach((equipo) => quitarEquipo(equipo.id))
  quitarRegistros('noticias', (noticia) => mismoId(noticia.liga_id, id))
  quitarRegistros('ligas', (liga) => mismoId(liga.id, id))
}
