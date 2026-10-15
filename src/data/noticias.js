import imagenCancha from '../assets/hero.png'
import { competiciones } from './competiciones'

export const noticias = competiciones.flatMap((liga) => (
  ['Comienza la segunda jornada', 'Una fecha llena de goles', 'Encuentro de clubes participantes'].map((titulo, indice) => ({
    id: (liga.id - 1) * 3 + indice + 1,
    liga_id: liga.id,
    titulo: `${titulo} — ${liga.nombre}`,
    contenido: `Los equipos de ${liga.nombre} se preparan para una nueva jornada de fútbol y compañerismo. Esta noticia es ficticia y permite explorar las tarjetas, la búsqueda y el formulario de edición de la demostración.`,
    fecha_publicacion: `2026-10-${15 - indice}`,
    imagen: indice === 0 ? imagenCancha : null,
  }))
))
