function ErroresFormulario({ mensajes }) {
  if (!mensajes.length) return null

  return (
    <div className="errores" role="alert">
      {mensajes.map((mensaje) => <p key={mensaje}>{mensaje}</p>)}
    </div>
  )
}

export default ErroresFormulario
