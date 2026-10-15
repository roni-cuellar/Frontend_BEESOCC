function HeaderDashboard({ seccion, nombreVisible, onAbrirMenu }) {
  return (
    <header className="dashboard-header">
      <button type="button" className="boton-menu" onClick={onAbrirMenu} aria-label="Abrir menú">☰</button>
      <div><span className="etiqueta-superior">Administración de liga</span><h1>{seccion}</h1></div>
      <span className="usuario-dashboard">{nombreVisible}</span>
    </header>
  )
}

export default HeaderDashboard
