import { buscarRegistro, datosLocales, guardarRegistro, mismoId, quitarRegistros, respuestaLocal, validarCampos } from './datosLocales'

export async function obtenerNoticias(ligaId, buscar = '') {
  buscarRegistro('ligas', ligaId)
  const termino = buscar.trim().toLocaleLowerCase('es')
  const noticias = datosLocales.noticias.filter((noticia) => mismoId(noticia.liga_id, ligaId) && `${noticia.titulo} ${noticia.contenido}`.toLocaleLowerCase('es').includes(termino)).sort((a, b) => b.fecha_publicacion.localeCompare(a.fecha_publicacion))
  return respuestaLocal({ noticias })
}
export const obtenerNoticia = async (id) => respuestaLocal({ noticia: buscarRegistro('noticias', id) })
function guardarNoticia(ligaId, datos, id) {
  validarCampos(datos, ['titulo', 'contenido', 'fecha_publicacion'])
  return respuestaLocal({ noticia: guardarRegistro('noticias', { ...datos, liga_id: Number(ligaId) }, id) })
}
export async function crearNoticia(ligaId, datos) {
  buscarRegistro('ligas', ligaId)
  return guardarNoticia(ligaId, datos)
}
export const actualizarNoticia = async (id, datos) => guardarNoticia(buscarRegistro('noticias', id).liga_id, datos, id)
export async function eliminarNoticia(id) {
  buscarRegistro('noticias', id)
  quitarRegistros('noticias', (noticia) => mismoId(noticia.id, id))
}
