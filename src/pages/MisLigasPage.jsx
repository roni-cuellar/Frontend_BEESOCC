import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import LigaCard from '../components/LigaCard'
import LigaForm from '../components/LigaForm'
import MarcaBeesocc from '../components/MarcaBeesocc'
import { obtenerErrores } from '../services/errores'
import { useBeesoccStore } from '../stores/beesoccStore'

function MisLigasPage() {
  const ligas = useBeesoccStore((estado) => estado.ligas)
  const { crearLiga, actualizarLiga, eliminarLiga } = useBeesoccStore((estado) => estado.accionesLigas)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ligaEditandoId, setLigaEditandoId] = useState(null)
  const [errores, setErrores] = useState([])
  const [guardando, setGuardando] = useState(false)
  const navegar = useNavigate()
  const ligaEditando = ligas.find((liga) => liga.id === ligaEditandoId) || null

  function abrirCreacion() {
    setLigaEditandoId(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(liga) {
    setLigaEditandoId(liga.id)
    setErrores([])
    setMostrarFormulario(true)
  }

  function guardarLiga(datos) {
    setGuardando(true)
    setErrores([])
    try {
      if (ligaEditando) actualizarLiga(ligaEditando.id, datos)
      else crearLiga(datos)
      setMostrarFormulario(false)
      setLigaEditandoId(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  function borrarLiga(liga) {
    if (!window.confirm(`¿Seguro que deseas eliminar "${liga.nombre}"?\n\nSe eliminará la información asociada a ella.`)) return
    setErrores([])
    try { eliminarLiga(liga.id) } catch (error) { setErrores(obtenerErrores(error)) }
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
          <div><span className="etiqueta-superior">Administración</span><h1>Mis Ligas</h1><p>Demostración local: selecciona una liga. Los cambios se conservan en este navegador.</p></div>
          <button type="button" onClick={abrirCreacion}>+ Crear Liga</button>
        </div>

        {!mostrarFormulario && <ErroresFormulario mensajes={errores} />}

        {ligas.length ? (
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


