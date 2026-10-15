import { buscarRegistro, guardarRegistro, sinEquipos, validarCampos } from './utilidades'

export function crearAccionesEquipos(set, get) {
  function guardarEquipo(ligaId, datos, id) {
    buscarRegistro(get(), 'ligas', ligaId)
    validarCampos(datos, ['nombre'])
    return guardarRegistro(set, get, 'equipos', { nombre: datos.nombre.trim(), ciudad: datos.ciudad || null, escudo: datos.escudo || null, liga_id: Number(ligaId) }, id)
  }

  return {
    crearEquipo: (ligaId, datos) => guardarEquipo(ligaId, datos),
    actualizarEquipo: (id, datos) => guardarEquipo(buscarRegistro(get(), 'equipos', id).liga_id, datos, id),
    eliminarEquipo: (id) => {
      const equipo = buscarRegistro(get(), 'equipos', id)
      set(sinEquipos(get(), [equipo.id]))
    },
  }
}
