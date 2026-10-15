import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErroresFormulario from '../components/ErroresFormulario'
import PartidoCard from '../components/PartidoCard'
import PartidoForm from '../components/PartidoForm'
import { obtenerErrores } from '../services/errores'
import { useBeesoccStore } from '../stores/beesoccStore'
import { seleccionarPartidos } from '../stores/selectores'
import { mismoId } from '../stores/utilidades'

function PartidosPage() {
  const partidosGuardados = useBeesoccStore((estado) => estado.partidos)
  const equiposGuardados = useBeesoccStore((estado) => estado.equipos)
  const eventosGuardados = useBeesoccStore((estado) => estado.eventos)
  const { crearPartido, actualizarPartido, eliminarPartido } = useBeesoccStore((estado) => estado.accionesPartidos)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [partidoEditandoId, setPartidoEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const { ligaId } = useParams()
  const navegar = useNavigate()
  const equipos = equiposGuardados.filter((equipo) => mismoId(equipo.liga_id, ligaId))
  const partidos = seleccionarPartidos({ partidos: partidosGuardados, equipos: equiposGuardados, eventos: eventosGuardados }, ligaId)
  const partidosFiltrados = filtro === 'todos' ? partidos : partidos.filter((partido) => partido.estado === filtro)
  const partidoEditando = partidos.find((partido) => partido.id === partidoEditandoId) || null

  function abrirCreacion() {
    if (equipos.length < 2) return
    setPartidoEditandoId(null)
    setErrores([])
    setMostrarFormulario(true)
  }

  function abrirEdicion(partido) {
    setPartidoEditandoId(partido.id)
    setErrores([])
    setMostrarFormulario(true)
  }

  function guardarPartido(datos) {
    setGuardando(true)
    setErrores([])
    try {
      if (partidoEditando) actualizarPartido(partidoEditando.id, datos)
      else crearPartido(ligaId, datos)
      setMostrarFormulario(false)
      setPartidoEditandoId(null)
    } catch (error) {
      setErrores(obtenerErrores(error))
    } finally {
      setGuardando(false)
    }
  }

  function borrarPartido(partido) {
    if (!window.confirm('¿Seguro que deseas eliminar este partido?')) return
    setErrores([])
    try { eliminarPartido(partido.id) } catch (error) { setErrores(obtenerErrores(error)) }
  }

  function cambiarEstado(partido, estado) {
    setErrores([])
    try { actualizarPartido(partido.id, { ...partido, estado }) } catch (error) { setErrores(obtenerErrores(error)) }
  }

  return (
    <section className="partidos-page">
      <div className="modulo-header"><div><span className="etiqueta-superior">Calendario</span><h2>Partidos</h2><p>Programa y administra los partidos de esta liga.</p></div><button type="button" onClick={abrirCreacion} disabled={equipos.length < 2}>+ Nuevo Partido</button></div>
      <ErroresFormulario mensajes={mostrarFormulario ? [] : errores} />
      {equipos.length < 2 && <div className="aviso-equipos"><p>Necesitas al menos dos equipos para crear un partido.</p><button type="button" onClick={() => navegar(`/ligas/${ligaId}/equipos`)}>Ir a Equipos</button></div>}
      {partidos.length > 0 && <div className="filtro-partidos"><label htmlFor="filtro-partidos">Mostrar</label><select id="filtro-partidos" value={filtro} onChange={(evento) => setFiltro(evento.target.value)}><option value="todos">Todos</option><option value="pendiente">Pendientes</option><option value="en_curso">En curso</option><option value="finalizado">Finalizados</option></select></div>}
      {!partidos.length ? (
        <div className="estado-vacio"><span>+</span><h2>Todavía no hay partidos programados</h2><p>Crea el primer partido de la liga.</p>{equipos.length >= 2 && <button type="button" onClick={abrirCreacion}>Crear Partido</button>}</div>
      ) : partidosFiltrados.length ? (
        <div className="partidos-grid">{partidosFiltrados.map((partido) => <PartidoCard key={partido.id} partido={partido} onEditar={abrirEdicion} onEliminar={borrarPartido} onCambiarEstado={cambiarEstado} onVer={(item) => navegar(`/ligas/${ligaId}/en-vivo?partido=${item.id}`)} />)}</div>
      ) : <p className="mensaje-estado">No hay partidos con este estado.</p>}
      {mostrarFormulario && <PartidoForm key={partidoEditando?.id || 'nuevo'} partidoInicial={partidoEditando} equipos={equipos} onGuardar={guardarPartido} onCancelar={() => { setMostrarFormulario(false); setErrores([]) }} guardando={guardando} errores={errores} />}
    </section>
  )
}

export default PartidosPage

