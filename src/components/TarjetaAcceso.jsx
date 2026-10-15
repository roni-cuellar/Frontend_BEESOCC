import { Link } from 'react-router-dom'

function TarjetaAcceso({ numero, titulo, descripcion, ruta }) {
  return (
    <Link className="tarjeta-acceso" to={ruta}>
      <span>{numero}</span>
      <h3>{titulo}</h3>
      <p>{descripcion}</p>
      <strong>Ir al módulo →</strong>
    </Link>
  )
}

export default TarjetaAcceso
