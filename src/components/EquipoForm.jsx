import { useState } from 'react'
import ErroresFormulario from './ErroresFormulario'

const valoresIniciales = { nombre: '', ciudad: '', escudo: '' }

function EquipoForm({ equipoInicial, onGuardar, onCancelar, guardando, errores }) {
  const [formulario, setFormulario] = useState(equipoInicial ? {
    nombre: equipoInicial.nombre,
    ciudad: equipoInicial.ciudad || '',
    escudo: equipoInicial.escudo || '',
  } : valoresIniciales)

  function manejarCambio(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  function manejarSubmit(evento) {
    evento.preventDefault()
    onGuardar({
      nombre: formulario.nombre,
      ciudad: formulario.ciudad || null,
      escudo: formulario.escudo || null,
    })
  }

  return (
    <div className="formulario-fondo" role="presentation">
      <section className="formulario-liga" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario-equipo">
        <div className="formulario-cabecera">
          <div><span className="etiqueta-superior">Equipo</span><h2 id="titulo-formulario-equipo">{equipoInicial ? 'Editar equipo' : 'Nuevo equipo'}</h2></div>
          <button type="button" className="cerrar-formulario" onClick={onCancelar} aria-label="Cerrar">×</button>
        </div>

        <ErroresFormulario mensajes={errores} />

        <form onSubmit={manejarSubmit}>
          <label htmlFor="nombre-equipo">Nombre del equipo</label>
          <input id="nombre-equipo" name="nombre" value={formulario.nombre} onChange={manejarCambio} required />
          <label htmlFor="ciudad-equipo">Ciudad</label>
          <input id="ciudad-equipo" name="ciudad" value={formulario.ciudad} onChange={manejarCambio} />
          <label htmlFor="escudo-equipo">Ruta local del escudo</label>
          <input id="escudo-equipo" name="escudo" value={formulario.escudo} onChange={manejarCambio} placeholder="/favicon.svg (opcional)" />

          <div className="formulario-acciones">
            <button type="button" className="boton-cancelar" onClick={onCancelar}>Cancelar</button>
            <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar equipo'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default EquipoForm
