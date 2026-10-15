import { useState } from 'react'
import ErroresFormulario from './ErroresFormulario'

function fechaActual() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

function NoticiaForm({ noticiaInicial, onGuardar, onCancelar, guardando, errores }) {
  const [formulario, setFormulario] = useState({ titulo: noticiaInicial?.titulo || '', contenido: noticiaInicial?.contenido || '', fecha_publicacion: noticiaInicial?.fecha_publicacion?.slice(0, 10) || fechaActual(), imagen: noticiaInicial?.imagen || '' })

  function manejarCambio(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  function manejarSubmit(evento) {
    evento.preventDefault()
    onGuardar({ ...formulario, imagen: formulario.imagen || null })
  }

  return (
    <div className="formulario-fondo" role="presentation">
      <section className="formulario-liga" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario-noticia">
        <div className="formulario-cabecera"><div><span className="etiqueta-superior">Noticias</span><h2 id="titulo-formulario-noticia">{noticiaInicial ? 'Editar noticia' : 'Nueva noticia'}</h2></div><button type="button" className="cerrar-formulario" onClick={onCancelar} aria-label="Cerrar">×</button></div>
        <ErroresFormulario mensajes={errores} />
        <form onSubmit={manejarSubmit}>
          <label htmlFor="titulo-noticia">Título</label><input id="titulo-noticia" name="titulo" value={formulario.titulo} onChange={manejarCambio} placeholder="Ej: Gran final del campeonato" maxLength="255" required />
          <label htmlFor="contenido-noticia">Contenido</label><textarea id="contenido-noticia" name="contenido" rows="7" value={formulario.contenido} onChange={manejarCambio} required />
          <label htmlFor="fecha-noticia">Fecha de publicación</label><input id="fecha-noticia" name="fecha_publicacion" type="date" value={formulario.fecha_publicacion} onChange={manejarCambio} required />
          <label htmlFor="imagen-noticia">Imagen local <small>(opcional)</small></label><input id="imagen-noticia" name="imagen" value={formulario.imagen} onChange={manejarCambio} placeholder="/" maxLength="255" />
          <div className="formulario-acciones"><button type="button" className="boton-cancelar" onClick={onCancelar}>Cancelar</button><button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : noticiaInicial ? 'Guardar cambios' : 'Publicar noticia'}</button></div>
        </form>
      </section>
    </div>
  )
}

export default NoticiaForm
