import { useState } from 'react'

function formatearFecha(fecha) {
  if (!fecha) return ''
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number)
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(anio, mes - 1, dia)))
}

function NoticiaCard({ noticia, onEditar, onEliminar }) {
  const [imagenValida, setImagenValida] = useState(Boolean(noticia.imagen))
  const resumen = noticia.contenido.length > 140 ? `${noticia.contenido.slice(0, 140)}...` : noticia.contenido

  return (
    <article className="noticia-card">
      <div className="noticia-card__imagen">
        {imagenValida ? <img src={noticia.imagen} alt={`Imagen de ${noticia.titulo}`} onError={() => setImagenValida(false)} /> : <span aria-hidden="true">*</span>}
      </div>
      <div className="noticia-card__contenido">
        <time dateTime={noticia.fecha_publicacion?.slice(0, 10)}>{formatearFecha(noticia.fecha_publicacion)}</time>
        <h2>{noticia.titulo}</h2>
        <p>{resumen}</p>
        <div className="noticia-card__acciones"><button type="button" className="boton-texto" onClick={() => onEditar(noticia)}>Editar</button><button type="button" className="boton-peligro" onClick={() => onEliminar(noticia)}>Eliminar</button></div>
      </div>
    </article>
  )
}

export default NoticiaCard
