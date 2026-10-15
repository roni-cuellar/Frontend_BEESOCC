function MarcaBeesocc({ compacta = false, clara = false }) {
  return (
    <div className={`marca-oficial ${compacta ? 'marca-oficial--compacta' : ''} ${clara ? 'marca-oficial--clara' : ''}`}>
      <strong>BEESOCC</strong>
      <small>Todo tu campeonato en un solo lugar.</small>
    </div>
  )
}

export default MarcaBeesocc
