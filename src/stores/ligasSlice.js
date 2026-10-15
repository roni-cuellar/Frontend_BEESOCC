import { buscarRegistro, guardarRegistro, mismoId, sinEquipos, validar, validarCampos } from './utilidades'

export function crearAccionesLigas(set, get) {
  function guardarLiga(datos, id) {
    validarCampos(datos, ['nombre', 'temporada', 'estado'])
    validar(['activa', 'inactiva'].includes(datos.estado), 'Selecciona un estado de liga válido.')
    return guardarRegistro(set, get, 'ligas', { nombre: datos.nombre.trim(), temporada: datos.temporada, descripcion: datos.descripcion || null, estado: datos.estado }, id)
  }

  return {
    crearLiga: (datos) => guardarLiga(datos),
    actualizarLiga: (id, datos) => guardarLiga(datos, id),
    eliminarLiga: (id) => {
      const estado = get()
      buscarRegistro(estado, 'ligas', id)
      const ids = estado.equipos.filter((equipo) => mismoId(equipo.liga_id, id)).map((equipo) => equipo.id)
      set({
        ...sinEquipos(estado, ids),
        ligas: estado.ligas.filter((liga) => !mismoId(liga.id, id)),
        noticias: estado.noticias.filter((noticia) => !mismoId(noticia.liga_id, id)),
      })
    },
  }
}
