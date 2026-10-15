import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EquipoCard from '../components/EquipoCard'
import EquipoForm from '../components/EquipoForm'
import ErroresFormulario from '../components/ErroresFormulario'
import { obtenerErrores } from '../services/errores'
import {
  actualizarEquipo,
  crearEquipo,
  eliminarEquipo,
  obtenerEquipos,
} from '../services/equipoService'

function EquiposPage() {
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [equipoEditando, setEquipoEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const { ligaId } = useParams()
  const navegar = useNavigate()

  useEffect(() => {
    let activo = true

    async function cargarEquipos() {
      setCargando(true)
      setEquipos([])
      setErrores([])

      try {
        // Cargamos los equipos de la liga indicada en la URL.
        const respuesta = await obtenerEquipos(ligaId)
        if (activo) setEquipos(respuesta.data.equipos)
      } catch (error) {
        if (!activo) return
        const mensaje = obtenerErrores(error)[0]
        setErrores([mensaje])
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarEquipos()
    return () => { activo = false }
  }, [ligaId])

  function abrirCreacion() {
    setEquipoEditando(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(equipo) {
    setEquipoEditando(equipo)
    setErrores([])
    setMostrarFormulario(true)
  }

  async function guardarEquipo(datos) {
    setGuardando(true)
    setErrores([])

    try {
      if (equipoEditando) {
        const respuesta = await actualizarEquipo(equipoEditando.id, datos)
        setEquipos((actuales) => actuales.map((equipo) => (
          equipo.id === equipoEditando.id ? respuesta.data.equipo : equipo
        )))
      } else {
        const respuesta = await crearEquipo(ligaId, datos)
        setEquipos((actuales) => [...actuales, respuesta.data.equipo])
      }

      setMostrarFormulario(false)
      setEquipoEditando(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  async function borrarEquipo(equipo) {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${equipo.nombre}"?\n\nTambién se eliminarán los jugadores asociados.`,
    )

    if (!confirmar) return

    setErrores([])

    try {
      await eliminarEquipo(equipo.id)
      // Eliminamos el equipo de la lista local sin recargar la página.
      setEquipos((actuales) => actuales.filter((item) => item.id !== equipo.id))
    } catch (error) {
      const mensaje = obtenerErrores(error)[0]
      setErrores([mensaje])
    }
  }

  return (
    <section className="equipos-page">
      <div className="modulo-header">
        <div><span className="etiqueta-superior">Competición</span><h2>Equipos</h2><p>Administra los equipos participantes de esta liga.</p></div>
        <button type="button" onClick={abrirCreacion}>+ Nuevo Equipo</button>
      </div>

      {!mostrarFormulario && <ErroresFormulario mensajes={errores} />}

      {cargando ? (
        <p className="mensaje-estado">Cargando equipos...</p>
      ) : equipos.length ? (
        <div className="equipos-grid">
          {equipos.map((equipo) => (
            <EquipoCard
              key={equipo.id}
              equipo={equipo}
              onEditar={abrirEdicion}
              onEliminar={borrarEquipo}
              onVerJugadores={(item) => navegar(`/ligas/${ligaId}/jugadores?equipo=${item.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="estado-vacio"><span>+</span><h2>Aún no hay equipos registrados</h2><p>Agrega el primer equipo para comenzar.</p><button type="button" onClick={abrirCreacion}>Crear Equipo</button></div>
      )}

      {mostrarFormulario && (
        <EquipoForm
          key={equipoEditando?.id || 'nuevo'}
          equipoInicial={equipoEditando}
          onGuardar={guardarEquipo}
          onCancelar={() => { setMostrarFormulario(false); setErrores([]) }}
          guardando={guardando}
          errores={errores}
        />
      )}
    </section>
  )
}

export default EquiposPage
