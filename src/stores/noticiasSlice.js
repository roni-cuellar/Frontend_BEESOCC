import { buscarRegistro, guardarRegistro, mismoId, validarCampos } from './utilidades'

export function crearAccionesNoticias(set, get) {
  function guardarNoticia(ligaId, datos, id) {
    buscarRegistro(get(), 'ligas', ligaId)
    validarCampos(datos, ['titulo', 'contenido', 'fecha_publicacion'])
    return guardarRegistro(set, get, 'noticias', { liga_id: Number(ligaId), titulo: datos.titulo.trim(), contenido: datos.contenido, fecha_publicacion: datos.fecha_publicacion, imagen: datos.imagen || null }, id)
  }

  return {
    crearNoticia: (ligaId, datos) => guardarNoticia(ligaId, datos),
    actualizarNoticia: (id, datos) => guardarNoticia(buscarRegistro(get(), 'noticias', id).liga_id, datos, id),
    eliminarNoticia: (id) => {
      buscarRegistro(get(), 'noticias', id)
      set((estado) => ({ noticias: estado.noticias.filter((noticia) => !mismoId(noticia.id, id)) }))
    },
  }
}
