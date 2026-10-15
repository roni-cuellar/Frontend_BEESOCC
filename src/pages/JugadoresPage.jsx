import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import JugadorCard from '../components/JugadorCard'
import JugadorForm from '../components/JugadorForm'
import { obtenerEquipos } from '../services/equipoService'
import { obtenerErrores } from '../services/errores'
import {
  actualizarJugador,
  crearJugador,
  eliminarJugador,
  obtenerJugadores,
} from '../services/jugadorService'

function JugadoresPage() {
  const [equipos, setEquipos] = useState([])
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('')
  const [jugadores, setJugadores] = useState([])
  const [cargandoEquipos, setCargandoEquipos] = useState(true)
  const [cargandoJugadores, setCargandoJugadores] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [jugadorEditando, setJugadorEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const { ligaId } = useParams()
  const [parametros] = useSearchParams()
  const equipoDesdeUrl = parametros.get('equipo')
  const navegar = useNavigate()

  useEffect(() => {
    let activo = true

    async function cargarEquipos() {
      setCargandoEquipos(true)
      setEquipos([])
      setEquipoSeleccionado('')
      setJugadores([])
      setErrores([])

      try {
        const respuesta = await obtenerEquipos(ligaId)
        if (!activo) return

        const nuevosEquipos = respuesta.data.equipos
        setEquipos(nuevosEquipos)

        // Seleccionamos el equipo de la URL solo si pertenece a esta liga.
        const equipoValido = nuevosEquipos.some((equipo) => String(equipo.id) === equipoDesdeUrl)
        setEquipoSeleccionado(equipoValido ? equipoDesdeUrl : String(nuevosEquipos[0]?.id || ''))
      } catch (error) {
        if (!activo) return
        setErrores([obtenerErrores(error)[0]])
      } finally {
        if (activo) setCargandoEquipos(false)
      }
    }

    cargarEquipos()
    return () => { activo = false }
  }, [equipoDesdeUrl, ligaId])

  useEffect(() => {
    let activo = true

    async function cargarJugadores() {
      setJugadores([])
      setErrores([])

      if (!equipoSeleccionado) {
        setCargandoJugadores(false)
        return
      }

      setCargandoJugadores(true)

      try {
        // Cargamos únicamente los jugadores del equipo seleccionado.
        const respuesta = await obtenerJugadores(equipoSeleccionado)
        if (activo) setJugadores(respuesta.data.jugadores)
      } catch (error) {
        if (!activo) return
        setErrores([obtenerErrores(error)[0]])
      } finally {
        if (activo) setCargandoJugadores(false)
      }
    }

    cargarJugadores()
    return () => { activo = false }
  }, [equipoSeleccionado])

  function seleccionarEquipo(evento) {
    setMostrarFormulario(false)
    setEquipoSeleccionado(evento.target.value)
  }

  function abrirCreacion() {
    setJugadorEditando(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(jugador) {
    setJugadorEditando(jugador)
    setErrores([])
    setMostrarFormulario(true)
  }

  async function guardarJugador(datos) {
    setGuardando(true)
    setErrores([])

    try {
      if (jugadorEditando) {
        const respuesta = await actualizarJugador(jugadorEditando.id, datos)
        setJugadores((actuales) => actuales.map((jugador) => (
          jugador.id === jugadorEditando.id ? respuesta.data.jugador : jugador
        )))
      } else {
        const respuesta = await crearJugador(equipoSeleccionado, datos)
        setJugadores((actuales) => [...actuales, respuesta.data.jugador])
      }

      setMostrarFormulario(false)
      setJugadorEditando(null)
    } catch (error) {
      const mensajes = obtenerErrores(error)
      const dorsalRepetido = mensajes.some((mensaje) => /taken|utilizado|tomado/i.test(mensaje))
      setErrores(dorsalRepetido
        ? ['El dorsal ya está siendo utilizado por otro jugador de este equipo.']
        : mensajes)
    } finally {
      setGuardando(false)
    }
  }

  async function borrarJugador(jugador) {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${jugador.nombre} ${jugador.apellido}?`)) return

    setErrores([])

    try {
      await eliminarJugador(jugador.id)
      setJugadores((actuales) => actuales.filter((item) => item.id !== jugador.id))
    } catch (error) {
      setErrores([obtenerErrores(error)[0]])
    }
  }

  if (cargandoEquipos) return <p className="mensaje-estado">Cargando equipos...</p>

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
          ) : cargandoJugadores ? (
            <p className="mensaje-estado">Cargando jugadores...</p>
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
