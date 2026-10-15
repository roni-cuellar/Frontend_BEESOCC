import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EquipoCard from '../components/EquipoCard'
import EquipoForm from '../components/EquipoForm'
import ErroresFormulario from '../components/ErroresFormulario'
import { obtenerErrores } from '../services/errores'
import { useBeesoccStore } from '../stores/beesoccStore'
import { mismoId } from '../stores/utilidades'

function EquiposPage() {
  const equiposGuardados = useBeesoccStore((estado) => estado.equipos)
  const { crearEquipo, actualizarEquipo, eliminarEquipo } = useBeesoccStore((estado) => estado.accionesEquipos)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [equipoEditandoId, setEquipoEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const { ligaId } = useParams()
  const navegar = useNavigate()
  const equipos = equiposGuardados.filter((equipo) => mismoId(equipo.liga_id, ligaId))
  const equipoEditando = equipos.find((equipo) => equipo.id === equipoEditandoId) || null

  function abrirCreacion() {
    setEquipoEditandoId(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(equipo) {
    setEquipoEditandoId(equipo.id)
    setErrores([])
    setMostrarFormulario(true)
  }

  function guardarEquipo(datos) {
    setGuardando(true)
    setErrores([])
    try {
      if (equipoEditando) actualizarEquipo(equipoEditando.id, datos)
      else crearEquipo(ligaId, datos)
      // La suscripción a Zustand actualiza las tarjetas sin copiar otra lista.
      setMostrarFormulario(false)
      setEquipoEditandoId(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  function borrarEquipo(equipo) {
    if (!window.confirm(`¿Seguro que deseas eliminar "${equipo.nombre}"?\n\nTambién se eliminarán los jugadores asociados.`)) return
    setErrores([])
    try { eliminarEquipo(equipo.id) } catch (error) { setErrores(obtenerErrores(error)) }
  }

  return (
    <section className="equipos-page">
      <div className="modulo-header">
        <div><span className="etiqueta-superior">Competición</span><h2>Equipos</h2><p>Administra los equipos participantes de esta liga.</p></div>
        <button type="button" onClick={abrirCreacion}>+ Nuevo Equipo</button>
      </div>

      {!mostrarFormulario && <ErroresFormulario mensajes={errores} />}

      {equipos.length ? (
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


