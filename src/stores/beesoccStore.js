import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { competiciones } from '../data/competiciones'
import { equipos } from '../data/equipos'
import { jugadores } from '../data/jugadores'
import { partidos } from '../data/partidos'
import { eventos } from '../data/eventos'
import { noticias } from '../data/noticias'
import { crearAccionesLigas } from './ligasSlice'
import { crearAccionesEquipos } from './equiposSlice'
import { crearAccionesJugadores } from './jugadoresSlice'
import { crearAccionesPartidos, crearAccionesEventos } from './partidosSlice'
import { crearAccionesNoticias } from './noticiasSlice'

export const CLAVE_DEMOSTRACION = 'beesocc_visual_datos_v1'
const colecciones = ['ligas', 'equipos', 'jugadores', 'partidos', 'eventos', 'noticias']

export function crearDatosIniciales() {
  return structuredClone({ ligas: competiciones, equipos, jugadores, partidos, eventos, noticias })
}

export const useBeesoccStore = create(persist((set, get) => ({
  ...crearDatosIniciales(),
  accionesLigas: crearAccionesLigas(set, get),
  accionesEquipos: crearAccionesEquipos(set, get),
  accionesJugadores: crearAccionesJugadores(set, get),
  accionesPartidos: crearAccionesPartidos(set, get),
  accionesEventos: crearAccionesEventos(set, get),
  accionesNoticias: crearAccionesNoticias(set, get),
}), {
  name: CLAVE_DEMOSTRACION,
  version: 1,
  storage: createJSONStorage(() => localStorage),
  // Persistimos solo entidades: filtros, formularios, acciones y estadísticas no se guardan.
  partialize: (estado) => Object.fromEntries(colecciones.map((coleccion) => [coleccion, estado[coleccion]])),
  merge: (guardado, actual) => {
    const valido = guardado && colecciones.every((coleccion) => Array.isArray(guardado[coleccion]) && guardado[coleccion].every((registro) => registro && Number.isInteger(registro.id)))
    return valido ? { ...actual, ...Object.fromEntries(colecciones.map((coleccion) => [coleccion, guardado[coleccion]])) } : actual
  },
}))
