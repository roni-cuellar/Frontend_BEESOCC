import { useState } from 'react'
import ErroresFormulario from './ErroresFormulario'

const valoresIniciales = {
  nombre: '',
  temporada: '',
  descripcion: '',
  estado: 'activa',
}

function LigaForm({ liga, errores, guardando, onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState(liga ? {
    nombre: liga.nombre,
    temporada: liga.temporada,
    descripcion: liga.descripcion || '',
    estado: liga.estado,
  } : valoresIniciales)

  function manejarCambio(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  function manejarSubmit(evento) {
    evento.preventDefault()
    onGuardar({ ...formulario, descripcion: formulario.descripcion || null })
  }

  return (
    <div className="formulario-fondo" role="presentation">
      <section className="formulario-liga" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario-liga">
        <div className="formulario-cabecera">
          <div>
            <span className="etiqueta-superior">Liga</span>
            <h2 id="titulo-formulario-liga">{liga ? 'Editar liga' : 'Crear liga'}</h2>
          </div>
          <button type="button" className="cerrar-formulario" onClick={onCancelar} aria-label="Cerrar">×</button>
        </div>

        <ErroresFormulario mensajes={errores} />

        <form onSubmit={manejarSubmit}>
          <label htmlFor="nombre-liga">Nombre</label>
          <input id="nombre-liga" name="nombre" value={formulario.nombre} onChange={manejarCambio} required />
          <label htmlFor="temporada-liga">Temporada</label>
          <input id="temporada-liga" name="temporada" value={formulario.temporada} onChange={manejarCambio} placeholder="2026" required />
          <label htmlFor="descripcion-liga">Descripción</label>
          <textarea id="descripcion-liga" name="descripcion" value={formulario.descripcion} onChange={manejarCambio} rows="4" />
          <label htmlFor="estado-liga">Estado</label>
          <select id="estado-liga" name="estado" value={formulario.estado} onChange={manejarCambio}>
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
          </select>

          <div className="formulario-acciones">
            <button type="button" className="boton-cancelar" onClick={onCancelar}>Cancelar</button>
            <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar liga'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default LigaForm
