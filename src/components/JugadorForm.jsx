import { useState } from 'react'
import ErroresFormulario from './ErroresFormulario'

const valoresIniciales = {
  nombre: '',
  apellido: '',
  dorsal: '',
  posicion: 'portero',
  fecha_nacido: '',
  foto: '',
}

function JugadorForm({ jugadorInicial, onGuardar, onCancelar, guardando, errores }) {
  const [formulario, setFormulario] = useState(jugadorInicial ? {
    nombre: jugadorInicial.nombre,
    apellido: jugadorInicial.apellido,
    dorsal: jugadorInicial.dorsal,
    posicion: jugadorInicial.posicion,
    fecha_nacido: jugadorInicial.fecha_nacido?.slice(0, 10) || '',
    foto: jugadorInicial.foto || '',
  } : valoresIniciales)

  function manejarCambio(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  function manejarSubmit(evento) {
    evento.preventDefault()
    onGuardar({
      nombre: formulario.nombre,
      apellido: formulario.apellido,
      dorsal: Number(formulario.dorsal),
      posicion: formulario.posicion,
      fecha_nacido: formulario.fecha_nacido || null,
      foto: formulario.foto || null,
    })
  }

  return (
    <div className="formulario-fondo" role="presentation">
      <section className="formulario-liga" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario-jugador">
        <div className="formulario-cabecera">
          <div><span className="etiqueta-superior">Jugador</span><h2 id="titulo-formulario-jugador">{jugadorInicial ? 'Editar jugador' : 'Nuevo jugador'}</h2></div>
          <button type="button" className="cerrar-formulario" onClick={onCancelar} aria-label="Cerrar">×</button>
        </div>

        <ErroresFormulario mensajes={errores} />

        <form onSubmit={manejarSubmit}>
          <div className="campos-dobles">
            <div><label htmlFor="nombre-jugador">Nombre</label><input id="nombre-jugador" name="nombre" value={formulario.nombre} onChange={manejarCambio} required /></div>
            <div><label htmlFor="apellido-jugador">Apellido</label><input id="apellido-jugador" name="apellido" value={formulario.apellido} onChange={manejarCambio} required /></div>
          </div>
          <div className="campos-dobles">
            <div><label htmlFor="dorsal-jugador">Dorsal</label><input id="dorsal-jugador" name="dorsal" type="number" min="0" value={formulario.dorsal} onChange={manejarCambio} required /></div>
            <div><label htmlFor="posicion-jugador">Posición</label><select id="posicion-jugador" name="posicion" value={formulario.posicion} onChange={manejarCambio}><option value="portero">Portero</option><option value="defensa">Defensa</option><option value="mediocampista">Mediocampista</option><option value="delantero">Delantero</option></select></div>
          </div>
          <label htmlFor="fecha-jugador">Fecha de nacimiento</label>
          <input id="fecha-jugador" name="fecha_nacido" type="date" value={formulario.fecha_nacido} onChange={manejarCambio} />
          <label htmlFor="foto-jugador">Ruta local de la foto</label>
          <input id="foto-jugador" name="foto" value={formulario.foto} onChange={manejarCambio} placeholder="/favicon.svg (opcional)" />

          <div className="formulario-acciones">
            <button type="button" className="boton-cancelar" onClick={onCancelar}>Cancelar</button>
            <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar jugador'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default JugadorForm
