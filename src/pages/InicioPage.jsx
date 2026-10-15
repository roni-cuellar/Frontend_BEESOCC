import { useState } from 'react'
import { Link } from 'react-router-dom'
import MarcaBeesocc from '../components/MarcaBeesocc'

const funcionalidades = [
  ['+', 'Gestiona tus ligas', 'Crea y administra varios campeonatos con datos locales de ejemplo.'],
  ['+', 'Organiza equipos', 'Mantén reunida la información de los clubes participantes.'],
  ['+', 'Administra jugadores', 'Gestiona los planteles, dorsales y posiciones de cada equipo.'],
  ['+', 'Programa partidos', 'Define jornadas, participantes, fechas y estados de cada encuentro.'],
  ['+', 'Registra eventos en vivo', 'Actualiza goles, tarjetas, asistencias y faltas durante el partido.'],
  ['+', 'Consulta estadísticas', 'Revisa tabla de posiciones y rendimiento de jugadores y equipos.'],
]

function InicioPage() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  function cerrarMenu() {
    setMenuAbierto(false)
  }

  return (
    <main className="landing-page">
      <header className="navbar-publico">
        <a href="#inicio" className="navbar-publico__marca" onClick={cerrarMenu}><MarcaBeesocc compacta /></a>
        <button type="button" className="navbar-publico__menu" onClick={() => setMenuAbierto((abierto) => !abierto)} aria-expanded={menuAbierto} aria-controls="navegacion-publica" aria-label="Abrir menú">☰</button>
        <div id="navegacion-publica" className={`navbar-publico__contenido ${menuAbierto ? 'navbar-publico__contenido--abierto' : ''}`}>
          <nav aria-label="Navegación pública"><a href="#inicio" onClick={cerrarMenu}>Inicio</a><a href="#informacion" onClick={cerrarMenu}>Información</a><a href="#nosotros" onClick={cerrarMenu}>Sobre nosotros</a><a href="#contacto" onClick={cerrarMenu}>Contacto</a></nav>
          <div className="navbar-publico__acciones"><Link to="/mis-ligas" className="enlace-boton enlace-boton--principal">Ir a ligas</Link></div>
        </div>
      </header>

      <section id="inicio" className="landing-hero">
        <div className="landing-contenedor landing-hero__grid">
          <div><span className="landing-etiqueta">Gestión de campeonatos de fútbol</span><h1>Todo tu campeonato en un solo lugar.</h1><p>Organiza ligas, equipos, jugadores, partidos, resultados y estadísticas desde una plataforma sencilla.</p><div className="landing-hero__acciones"><Link to="/mis-ligas" className="enlace-boton enlace-boton--principal">Ir a Mis Ligas</Link></div></div>
          <div className="landing-marcador" aria-label="Representación de un partido en BEESOCC"><span>PARTIDO EN DIRECTO</span><div><strong>Equipo local</strong><b>2 <small>-</small> 1</b><strong>Equipo visitante</strong></div><p>67&apos; · Marcador y eventos actualizados</p></div>
        </div>
      </section>

      <section id="informacion" className="landing-seccion"><div className="landing-contenedor"><div className="landing-titulo"><span className="landing-etiqueta">Información</span><h2>Administra tu campeonato con claridad</h2><p>BEESOCC centraliza el trabajo deportivo para que puedas concentrarte en organizar la competición.</p></div><div className="funcionalidades-grid">{funcionalidades.map(([icono, titulo, descripcion]) => <article key={titulo}><span>{icono}</span><h3>{titulo}</h3><p>{descripcion}</p></article>)}</div></div></section>

      <section className="landing-seccion landing-seccion--suave"><div className="landing-contenedor"><div className="landing-titulo"><span className="landing-etiqueta">Cómo funciona</span><h2>Comienza en tres pasos</h2></div><div className="pasos-grid"><article><span>1</span><h3>Explora la demostración</h3><p>Accede directamente a las ligas y los equipos de ejemplo.</p></article><article><span>2</span><h3>Crea una liga</h3><p>Define tu campeonato y agrega los equipos participantes.</p></article><article><span>3</span><h3>Gestiona la competición</h3><p>Programa partidos y consulta resultados y estadísticas.</p></article></div></div></section>

      <section className="landing-seccion"><div className="landing-contenedor landing-destacado"><div><span className="landing-etiqueta">Sistema multiliga</span><h2>Varias ligas, una demostración</h2><p>Organiza diferentes campeonatos sin mezclar equipos, jugadores, partidos o noticias.</p></div><div className="mini-ligas"><strong>Mis Ligas</strong><span>Liga SENA <b>Activa</b></span><span>Liga Universitaria <b>Activa</b></span><span>Liga Empresarial <b>Activa</b></span></div></div></section>

      <section className="landing-seccion landing-seccion--oscura"><div className="landing-contenedor landing-doble"><div><span className="landing-etiqueta">Partido en directo</span><h2>Registra lo importante mientras ocurre</h2><p>Goles, asistencias, tarjetas y faltas alimentan el marcador y la línea de tiempo del encuentro.</p><div className="mini-eventos"><span>12&apos; + Gol</span><span>28&apos; + Tarjeta amarilla</span><span>41&apos; + Asistencia</span></div></div><div><span className="landing-etiqueta">Estadísticas</span><h2>Consulta el rendimiento de la liga</h2><p>Revisa clasificación, goleadores, asistencias, tarjetas y estadísticas por equipo.</p><div className="mini-tabla"><span><b>1</b> Equipo Verde <strong>25 PTS</strong></span><span><b>2</b> Tigres FC <strong>22 PTS</strong></span><span><b>3</b> Águilas FC <strong>18 PTS</strong></span></div></div></div></section>

      <section id="nosotros" className="landing-seccion"><div className="landing-contenedor landing-texto"><span className="landing-etiqueta">Sobre nosotros</span><h2>Una plataforma pensada para organizar mejor</h2><p>BEESOCC nace para simplificar la organización de campeonatos de fútbol y centralizar toda su información en un solo lugar.</p></div></section>

      <section id="contacto" className="landing-seccion landing-seccion--suave"><div className="landing-contenedor landing-texto"><span className="landing-etiqueta">Contacto</span><h2>¿Quieres conocer más sobre BEESOCC?</h2><p>El canal de contacto estará disponible próximamente. Mientras tanto, puedes explorar los datos de ejemplo de esta demostración.</p></div></section>

      <section className="landing-cta"><div className="landing-contenedor"><h2>¿Listo para organizar tu campeonato?</h2><p>Explora la demostración y conoce las pantallas de BEESOCC sin registrarte.</p><Link to="/mis-ligas" className="enlace-boton enlace-boton--claro">Ir a ligas</Link></div></section>

      <footer className="landing-footer"><div className="landing-contenedor"><MarcaBeesocc clara /><nav aria-label="Navegación del pie"><a href="#inicio">Inicio</a><a href="#informacion">Información</a><a href="#nosotros">Sobre nosotros</a><a href="#contacto">Contacto</a></nav><p>© 2026 BEESOCC</p></div></footer>
    </main>
  )
}

export default InicioPage
