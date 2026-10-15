import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import LigaCard from '../components/LigaCard'
import LigaForm from '../components/LigaForm'
import MarcaBeesocc from '../components/MarcaBeesocc'
import { obtenerErrores } from '../services/errores'
import {
  actualizarLiga,
  crearLiga,
  eliminarLiga,
  obtenerLigas,
} from '../services/ligaService'

function MisLigasPage() {
  const [ligas, setLigas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ligaEditando, setLigaEditando] = useState(null)
  const [errores, setErrores] = useState([])
  const [guardando, setGuardando] = useState(false)

  const navegar = useNavigate()

  useEffect(() => {
    let activo = true

    async function cargarLigas() {
      try {
        const respuesta = await obtenerLigas()
        if (activo) setLigas(respuesta.data.ligas)
      } catch {
        if (activo) setErrores(['No se pudieron cargar las ligas.'])
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarLigas()

    return () => { activo = false }
  }, [])

  function abrirCreacion() {
    setLigaEditando(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(liga) {
    setLigaEditando(liga)
    setErrores([])
    setMostrarFormulario(true)
  }

  async function guardarLiga(datos) {
    setGuardando(true)
    setErrores([])

    try {
      if (ligaEditando) {
        const respuesta = await actualizarLiga(ligaEditando.id, datos)
        setLigas((actuales) => actuales.map((liga) => (
          liga.id === ligaEditando.id ? respuesta.data.liga : liga
        )))
      } else {
        const respuesta = await crearLiga(datos)
        setLigas((actuales) => [...actuales, respuesta.data.liga])
      }

      setMostrarFormulario(false)
      setLigaEditando(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  async function borrarLiga(liga) {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${liga.nombre}"?\n\nSe eliminará la información asociada a ella.`,
    )

    if (!confirmar) return

    setErrores([])

    try {
      await eliminarLiga(liga.id)
      setLigas((actuales) => actuales.filter((item) => item.id !== liga.id))
    } catch {
      setErrores(['No se pudo eliminar la liga.'])
    }
  }

  function administrarLiga(liga) {

    navegar(`/ligas/${liga.id}/dashboard`)
  }

  return (
    <main className="mis-ligas-page">
      <header className="barra-superior">
        <MarcaBeesocc compacta />
        <div className="usuario-acciones"><span>Demo · datos locales</span><button type="button" className="boton-salir" onClick={() => navegar('/')}>Volver al inicio</button></div>
      </header>

      <section className="contenido-ligas">
        <div className="titulo-acciones">
          <div><span className="etiqueta-superior">Administración</span><h1>Mis Ligas</h1><p>Demostración local: selecciona una liga. Los cambios se reinician al actualizar.</p></div>
          <button type="button" onClick={abrirCreacion}>+ Crear Liga</button>
        </div>

        {!mostrarFormulario && <ErroresFormulario mensajes={errores} />}

        {cargando ? (
          <p className="mensaje-estado">Cargando ligas...</p>
        ) : ligas.length ? (
          <div className="ligas-grid">
            {ligas.map((liga) => (
              <LigaCard key={liga.id} liga={liga} onAdministrar={administrarLiga} onEditar={abrirEdicion} onEliminar={borrarLiga} />
            ))}
          </div>
        ) : (
          <div className="estado-vacio"><span>⚽</span><h2>Aún no tienes ligas</h2><p>Crea tu primera liga para comenzar a administrar tu campeonato.</p><button type="button" onClick={abrirCreacion}>Crear Liga</button></div>
        )}
      </section>

      {mostrarFormulario && (
        <LigaForm
          key={ligaEditando?.id || 'nueva'}
          liga={ligaEditando}
          errores={errores}
          guardando={guardando}
          onGuardar={guardarLiga}
          onCancelar={() => { setMostrarFormulario(false); setErrores([]) }}
        />
      )}
    </main>
  )
}

export default MisLigasPage
