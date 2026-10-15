import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import NoticiaCard from '../components/NoticiaCard'
import NoticiaForm from '../components/NoticiaForm'
import { obtenerErrores } from '../services/errores'
import { useBeesoccStore } from '../stores/beesoccStore'
import { mismoId } from '../stores/utilidades'

function NoticiasPage() {
  const noticiasGuardadas = useBeesoccStore((estado) => estado.noticias)
  const { crearNoticia, actualizarNoticia, eliminarNoticia } = useBeesoccStore((estado) => estado.accionesNoticias)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [noticiaEditandoId, setNoticiaEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const { ligaId } = useParams()
  const termino = busquedaAplicada.toLocaleLowerCase('es')
  const noticias = noticiasGuardadas.filter((noticia) => mismoId(noticia.liga_id, ligaId) && `${noticia.titulo} ${noticia.contenido}`.toLocaleLowerCase('es').includes(termino)).sort((a, b) => b.fecha_publicacion.localeCompare(a.fecha_publicacion))
  const noticiaEditando = noticiasGuardadas.find((noticia) => noticia.id === noticiaEditandoId) || null

  function buscar(evento) {
    evento.preventDefault()
    setBusquedaAplicada(busqueda.trim())
  }

  function limpiarBusqueda() {
    setBusqueda('')
    setBusquedaAplicada('')
  }

  function abrirCreacion() {
    setNoticiaEditandoId(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(noticia) {
    setNoticiaEditandoId(noticia.id)
    setErrores([])
    setMostrarFormulario(true)
  }

  function guardarNoticia(datos) {
    setGuardando(true)
    setErrores([])
    try {
      if (noticiaEditando) actualizarNoticia(noticiaEditando.id, datos)
      else crearNoticia(ligaId, datos)
      setMostrarFormulario(false)
      setNoticiaEditandoId(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  function borrarNoticia(noticia) {
    if (!window.confirm('¿Seguro que deseas eliminar esta noticia?')) return
    setErrores([])
    try { eliminarNoticia(noticia.id) } catch (error) { setErrores(obtenerErrores(error)) }
  }

  return (
    <section className="noticias-page">
      <div className="modulo-header"><div><span className="etiqueta-superior">Actualidad</span><h2>Noticias</h2><p>Publica y administra las noticias de esta liga.</p></div><button type="button" onClick={abrirCreacion}>+ Nueva Noticia</button></div>
      <form className="noticias-buscador" onSubmit={buscar}><label htmlFor="buscar-noticias" className="sr-only">Buscar noticias</label><input id="buscar-noticias" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar noticias..." /><button type="submit">Buscar</button>{busquedaAplicada && <button type="button" className="boton-cancelar" onClick={limpiarBusqueda}>Limpiar</button>}</form>
      {!mostrarFormulario && <ErroresFormulario mensajes={errores} />}

      {noticias.length ? (
        <div className="noticias-grid">{noticias.map((noticia) => <NoticiaCard key={noticia.id} noticia={noticia} onEditar={abrirEdicion} onEliminar={borrarNoticia} />)}</div>
      ) : busquedaAplicada ? (
        <div className="estado-vacio"><span>🔎</span><h2>No encontramos noticias para esta búsqueda</h2><button type="button" onClick={limpiarBusqueda}>Limpiar búsqueda</button></div>
      ) : (
        <div className="estado-vacio"><span>📰</span><h2>Todavía no hay noticias publicadas</h2><p>Publica la primera noticia de esta liga.</p><button type="button" onClick={abrirCreacion}>Crear Noticia</button></div>
      )}

      {mostrarFormulario && <NoticiaForm key={noticiaEditando?.id || 'nueva'} noticiaInicial={noticiaEditando} onGuardar={guardarNoticia} onCancelar={() => { setMostrarFormulario(false); setErrores([]) }} guardando={guardando} errores={errores} />}
    </section>
  )
}

export default NoticiasPage


