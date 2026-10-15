import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import JugadorCard from '../components/JugadorCard'
import JugadorForm from '../components/JugadorForm'
import { obtenerErrores } from '../services/errores'
import { useBeesoccStore } from '../stores/beesoccStore'
import { mismoId } from '../stores/utilidades'

function JugadoresPage() {
  const equiposGuardados = useBeesoccStore((estado) => estado.equipos)
  const jugadoresGuardados = useBeesoccStore((estado) => estado.jugadores)
  const { crearJugador, actualizarJugador, eliminarJugador } = useBeesoccStore((estado) => estado.accionesJugadores)
  const [seleccion, setSeleccion] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [jugadorEditandoId, setJugadorEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const { ligaId } = useParams()
  const [parametros] = useSearchParams()
  const navegar = useNavigate()
  const equipos = equiposGuardados.filter((equipo) => mismoId(equipo.liga_id, ligaId))
  const equipoDesdeUrl = parametros.get('equipo')
  const equipoInicial = equipos.find((equipo) => mismoId(equipo.id, equipoDesdeUrl)) || equipos[0]
  const equipoElegido = seleccion?.origen === equipoDesdeUrl ? seleccion.id : String(equipoInicial?.id || '')
  const equipoSeleccionado = equipos.some((equipo) => mismoId(equipo.id, equipoElegido)) ? equipoElegido : ''
  const jugadores = jugadoresGuardados.filter((jugador) => mismoId(jugador.equipo_id, equipoSeleccionado))
  const jugadorEditando = jugadores.find((jugador) => jugador.id === jugadorEditandoId) || null

  function seleccionarEquipo(evento) {
    setMostrarFormulario(false)
    setErrores([])
    setSeleccion({ origen: equipoDesdeUrl, id: evento.target.value })
  }

  function abrirCreacion() {
    setJugadorEditandoId(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(jugador) {
    setJugadorEditandoId(jugador.id)
    setErrores([])
    setMostrarFormulario(true)
  }

  function guardarJugador(datos) {
    setGuardando(true)
    setErrores([])
    try {
      if (jugadorEditando) actualizarJugador(jugadorEditando.id, datos)
      else crearJugador(equipoSeleccionado, datos)
      setMostrarFormulario(false)
      setJugadorEditandoId(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  function borrarJugador(jugador) {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${jugador.nombre} ${jugador.apellido}?`)) return
    setErrores([])
    try { eliminarJugador(jugador.id) } catch (error) { setErrores(obtenerErrores(error)) }
  }

  return (
    <section className="jugadores-page">
      <div className="modulo-header">
        <div><span className="etiqueta-superior">Planteles</span><h2>Jugadores</h2><p>Administra los jugadores de los equipos de esta liga.</p></div>
        {equipoSeleccionado && <button type="button" onClick={abrirCreacion}>+ Nuevo Jugador</button>}
      </div>

      <ErroresFormulario mensajes={mostrarFormulario ? [] : errores} />

      {!equipos.length ? (
        <div className="estado-vacio"><span>+</span><h2>Esta liga todavía no tiene equipos</h2><p>Primero debes crear un equipo para poder registrar jugadores.</p><button type="button" onClick={() => navegar(`/ligas/${ligaId}/equipos`)}>Ir a Equipos</button></div>
      ) : (
        <>
          <div className="selector-equipo"><label htmlFor="equipo-jugadores">Equipo</label><select id="equipo-jugadores" value={equipoSeleccionado} onChange={seleccionarEquipo}><option value="">Selecciona un equipo</option>{equipos.map((equipo) => <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>)}</select></div>

          {!equipoSeleccionado ? (
            <p className="mensaje-estado">Selecciona un equipo para consultar sus jugadores.</p>
          ) : jugadores.length ? (
            <div className="jugadores-grid">{jugadores.map((jugador) => <JugadorCard key={jugador.id} jugador={jugador} onEditar={abrirEdicion} onEliminar={borrarJugador} />)}</div>
          ) : (
            <div className="estado-vacio"><span>👤</span><h2>Este equipo todavía no tiene jugadores</h2><p>Agrega el primer jugador para comenzar.</p><button type="button" onClick={abrirCreacion}>Crear Jugador</button></div>
          )}
        </>
      )}

      {mostrarFormulario && (
        <JugadorForm
          key={jugadorEditando?.id || 'nuevo'}
          jugadorInicial={jugadorEditando}
          onGuardar={guardarJugador}
          onCancelar={() => { setMostrarFormulario(false); setErrores([]) }}
          guardando={guardando}
          errores={errores}
        />
      )}
    </section>
  )
}

export default JugadoresPage


