import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import NoticiaCard from '../components/NoticiaCard'
import NoticiaForm from '../components/NoticiaForm'
import { obtenerErrores } from '../services/errores'
import { actualizarNoticia, crearNoticia, eliminarNoticia, obtenerNoticias } from '../services/noticiaService'

function NoticiasPage() {
  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [noticiaEditando, setNoticiaEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const { ligaId } = useParams()

  async function cargarNoticias(termino = busquedaAplicada) {
    setCargando(true)
    setNoticias([])
    setErrores([])
    try {
      // Los datos locales se ordenan por fecha de publicación.
      const respuesta = await obtenerNoticias(ligaId, termino)
      setNoticias(respuesta.data.noticias)
    } catch (error) {
      setErrores([obtenerErrores(error)[0]])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true

    async function cargarLiga() {
      setCargando(true)
      setNoticias([])
      setBusqueda('')
      setBusquedaAplicada('')
      setErrores([])
      try {
        const respuesta = await obtenerNoticias(ligaId)
        if (activo) setNoticias(respuesta.data.noticias)
      } catch (error) {
        if (activo) setErrores([obtenerErrores(error)[0]])
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarLiga()
    return () => { activo = false }
  }, [ligaId])

  function buscar(evento) {
    evento.preventDefault()
    const termino = busqueda.trim()
    setBusquedaAplicada(termino)
    cargarNoticias(termino)
  }

  function limpiarBusqueda() {
    setBusqueda('')
    setBusquedaAplicada('')
    cargarNoticias('')
  }

  function abrirCreacion() {
    setNoticiaEditando(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(noticia) {
    setNoticiaEditando(noticia)
    setErrores([])
    setMostrarFormulario(true)
  }

  async function guardarNoticia(datos) {
    setGuardando(true)
    setErrores([])
    try {
      if (noticiaEditando) await actualizarNoticia(noticiaEditando.id, datos)
      else await crearNoticia(ligaId, datos)
      setMostrarFormulario(false)
      setNoticiaEditando(null)
      await cargarNoticias(busquedaAplicada)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  async function borrarNoticia(noticia) {
    if (!window.confirm('¿Seguro que deseas eliminar esta noticia?')) return
    setErrores([])
    try {
      await eliminarNoticia(noticia.id)
      setNoticias((actuales) => actuales.filter((item) => item.id !== noticia.id))
    } catch (error) {
      setErrores([obtenerErrores(error)[0]])
    }
  }

  return (
    <section className="noticias-page">
      <div className="modulo-header"><div><span className="etiqueta-superior">Actualidad</span><h2>Noticias</h2><p>Publica y administra las noticias de esta liga.</p></div><button type="button" onClick={abrirCreacion}>+ Nueva Noticia</button></div>
      <form className="noticias-buscador" onSubmit={buscar}><label htmlFor="buscar-noticias" className="sr-only">Buscar noticias</label><input id="buscar-noticias" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar noticias..." /><button type="submit">Buscar</button>{busquedaAplicada && <button type="button" className="boton-cancelar" onClick={limpiarBusqueda}>Limpiar</button>}</form>
      {!mostrarFormulario && <ErroresFormulario mensajes={errores} />}

      {cargando ? <p className="mensaje-estado">Cargando noticias...</p> : noticias.length ? (
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
