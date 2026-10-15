import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

// Almacenamiento aislado: las pruebas no alteran la demostración del navegador.
const memoria = new Map()
globalThis.localStorage = {
  getItem: (clave) => memoria.get(clave) ?? null,
  setItem: (clave, valor) => memoria.set(clave, String(valor)),
  removeItem: (clave) => memoria.delete(clave),
}
const servidor = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
let comprobaciones = 0
async function comprobar(nombre, prueba) {
  await prueba()
  comprobaciones += 1
  console.log(`OK ${nombre}`)
}

try {
  const { useBeesoccStore: store, crearDatosIniciales, CLAVE_DEMOSTRACION } = await servidor.ssrLoadModule('/src/stores/beesoccStore.js')
  const { seleccionarPartidos, seleccionarEventos, seleccionarTabla, seleccionarEstadistica } = await servidor.ssrLoadModule('/src/stores/selectores.js')
  const estado = () => store.getState()
  const reiniciar = () => store.setState(crearDatosIniciales())
  const { default: App } = await servidor.ssrLoadModule('/src/App.jsx')
  const comprobarRelaciones = () => {
    const datos = estado()
    for (const equipo of datos.equipos) assert.ok(datos.ligas.some((liga) => liga.id === equipo.liga_id))
    for (const jugador of datos.jugadores) assert.ok(datos.equipos.some((equipo) => equipo.id === jugador.equipo_id))
    for (const noticia of datos.noticias) assert.ok(datos.ligas.some((liga) => liga.id === noticia.liga_id))
    for (const partido of datos.partidos) {
      assert.notEqual(partido.equipo_local_id, partido.equipo_visitante_id)
      for (const id of [partido.equipo_local_id, partido.equipo_visitante_id]) assert.ok(datos.equipos.some((equipo) => equipo.id === id && equipo.liga_id === partido.liga_id))
    }
    for (const evento of datos.eventos) {
      const partido = datos.partidos.find((item) => item.id === evento.partido_id)
      assert.ok(partido)
      assert.ok([partido.equipo_local_id, partido.equipo_visitante_id].includes(evento.equipo_id))
      if (evento.jugador_id != null) {
        const jugador = datos.jugadores.find((item) => item.id === evento.jugador_id)
        assert.ok(jugador)
        if (evento.tipo === 'autogol') assert.notEqual(jugador.equipo_id, evento.equipo_id)
        else assert.equal(jugador.equipo_id, evento.equipo_id)
      }
    }
  }

  await comprobar('datos actuales y relaciones entre entidades', () => {
    assert.deepEqual(['ligas', 'equipos', 'jugadores', 'partidos', 'eventos', 'noticias'].map((clave) => estado()[clave].length), [3, 12, 48, 12, 57, 9])
    comprobarRelaciones()
  })
  await comprobar('render de todas las rutas sin servidor ni autenticación', () => {
    const rutas = [['/', 'Todo tu campeonato'], ['/mis-ligas', 'Mis Ligas']]
    for (const ligaId of [1, 2, 3]) {
      for (const [ruta, titulo] of [['dashboard', 'Gestión principal'], ['equipos', 'Nuevo Equipo'], ['jugadores', 'Nuevo Jugador'], ['partidos', 'Nuevo Partido'], ['en-vivo', 'Selecciona un partido'], ['noticias', 'Nueva Noticia'], ['tabla', 'Tabla de Posiciones'], ['estadisticas', 'Goleadores']]) rutas.push([`/ligas/${ligaId}/${ruta}`, titulo])
    }
    rutas.push(['/ligas/1/en-vivo?partido=3', 'Línea de tiempo'], ['/ligas/1/en-vivo?partido=5', 'El partido no existe'], ['/ligas/999/dashboard', 'Esta competición no existe'])
    for (const [ruta, texto] of rutas) {
      const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [ruta] }, createElement(App)))
      assert.ok(html.includes(texto), `${ruta} debe mostrar ${texto}`)
      assert.ok(!html.includes('Iniciar sesión'))
    }
  })
  await comprobar('edición de equipo reactiva e inmutable en pantallas relacionadas', () => {
    const anterior = estado().equipos
    const nombreAnterior = anterior[0].nombre
    let avisos = 0
    const cancelar = store.subscribe((datos) => {
      avisos += 1
      assert.equal(seleccionarPartidos(datos, 1)[0].equipos[0].nombre, 'Equipo editado en prueba')
      assert.equal(seleccionarEventos(datos, 1)[0].equipo.nombre, 'Equipo editado en prueba')
      assert.equal(seleccionarTabla(datos, 1).find((fila) => fila.equipo_id === 1).nombre, 'Equipo editado en prueba')
      assert.equal(seleccionarEstadistica(datos, 1, 'equipos')[0].nombre, 'Equipo editado en prueba')
    })
    estado().accionesEquipos.actualizarEquipo(1, { nombre: 'Equipo editado en prueba', ciudad: 'Valle Claro' })
    cancelar()
    assert.equal(avisos, 1)
    assert.notEqual(estado().equipos, anterior)
    assert.equal(anterior[0].nombre, nombreAnterior)
  })
  await comprobar('CRUD de ligas, equipos y noticias con búsqueda derivada', () => {
    const liga = estado().accionesLigas.crearLiga({ nombre: 'Liga de prueba', temporada: '2026', estado: 'activa' })
    estado().accionesLigas.actualizarLiga(liga.id, { ...liga, nombre: 'Liga editada' })
    const equipo = estado().accionesEquipos.crearEquipo(liga.id, { nombre: 'Equipo temporal' })
    estado().accionesEquipos.actualizarEquipo(equipo.id, { nombre: 'Equipo editado' })
    const noticia = estado().accionesNoticias.crearNoticia(liga.id, { titulo: 'Noticia temporal', contenido: 'Ejemplo ficticio.', fecha_publicacion: '2026-10-15' })
    estado().accionesNoticias.actualizarNoticia(noticia.id, { ...noticia, titulo: 'Noticia editada' })
    assert.equal(estado().noticias.filter((item) => item.liga_id === liga.id && item.titulo.includes('editada')).length, 1)
    estado().accionesNoticias.eliminarNoticia(noticia.id)
    estado().accionesEquipos.eliminarEquipo(equipo.id)
    estado().accionesLigas.eliminarLiga(liga.id)
    comprobarRelaciones()
  })
  await comprobar('dorsal único por equipo, edición y nombre de jugador actualizado', () => {
    const datos = { nombre: 'Jugador', apellido: 'Ejemplo', dorsal: 10, posicion: 'delantero' }
    const jugador = estado().accionesJugadores.crearJugador(1, datos)
    assert.throws(() => estado().accionesJugadores.crearJugador(1, datos), /dorsal/)
    const otro = estado().accionesJugadores.crearJugador(2, datos)
    estado().accionesJugadores.actualizarJugador(jugador.id, { ...datos, nombre: 'Nombre editado' })
    const evento = estado().accionesEventos.crearEvento(3, { equipo_id: 1, jugador_id: jugador.id, tipo: 'gol', minuto: 60 })
    assert.equal(seleccionarEventos(estado(), 3).find((item) => item.id === evento.id).jugador.nombre, 'Nombre editado')
    assert.equal(seleccionarEstadistica(estado(), 1, 'goleadores').find((fila) => fila.jugador.id === jugador.id).jugador.nombre, 'Nombre editado')
    estado().accionesJugadores.eliminarJugador(jugador.id)
    assert.equal(estado().eventos.find((item) => item.id === evento.id).jugador_id, null)
    estado().accionesEventos.eliminarEvento(evento.id)
    estado().accionesJugadores.eliminarJugador(otro.id)
    comprobarRelaciones()
  })
  await comprobar('eventos sincronizan marcador, calendario, clasificación y estadísticas', () => {
    reiniciar()
    const anterior = estado().eventos
    const evento = estado().accionesEventos.crearEvento(3, { equipo_id: 1, jugador_id: 4, tipo: 'gol', minuto: 50 })
    assert.equal(anterior.length, 57)
    assert.equal(seleccionarPartidos(estado(), 1).find((partido) => partido.id === 3).equipos[0].goles_marcados, 2)
    assert.equal(seleccionarTabla(estado(), 1).find((fila) => fila.equipo_id === 1).pts, 3)
    assert.equal(seleccionarEstadistica(estado(), 1, 'goleadores').find((fila) => fila.jugador.id === 4).goles, 4)
    estado().accionesPartidos.actualizarPartido(3, { ...estado().partidos.find((partido) => partido.id === 3), estado: 'finalizado' })
    assert.equal(seleccionarTabla(estado(), 1).find((fila) => fila.equipo_id === 1).pts, 6)
    assert.throws(() => estado().accionesEventos.eliminarEvento(evento.id), /en curso/)
    estado().accionesPartidos.eliminarPartido(3)
    assert.equal(seleccionarTabla(estado(), 1).find((fila) => fila.equipo_id === 1).pts, 3)
    assert.ok(!estado().eventos.some((item) => item.partido_id === 3))
  })
  await comprobar('partidos y eventos rechazan participantes inválidos sin modificar datos', () => {
    reiniciar()
    const partido = { jornada: 3, fecha: '2026-10-20', hora: '16:00', estado: 'pendiente', equipo_local_id: 1, equipo_visitante_id: 1 }
    const anterior = estado()
    assert.throws(() => estado().accionesPartidos.crearPartido(1, partido), /diferentes/)
    assert.throws(() => estado().accionesPartidos.crearPartido(1, { ...partido, equipo_visitante_id: 5 }), /esta liga/)
    assert.throws(() => estado().accionesEventos.crearEvento(3, { equipo_id: 1, jugador_id: 8, tipo: 'gol', minuto: 20 }), /jugador/)
    assert.equal(estado(), anterior)
    const nuevo = estado().accionesPartidos.crearPartido(1, { ...partido, equipo_visitante_id: 2 })
    estado().accionesPartidos.actualizarPartido(nuevo.id, { ...nuevo, estado: 'en_curso' })
    const evento = estado().accionesEventos.crearEvento(nuevo.id, { equipo_id: 1, jugador_id: 8, tipo: 'autogol', minuto: 10 })
    estado().accionesEventos.actualizarEvento(evento.id, { equipo_id: 2, jugador_id: 8, tipo: 'gol', minuto: 11 })
    assert.equal(seleccionarPartidos(estado(), 1).find((item) => item.id === nuevo.id).equipos[1].goles_marcados, 1)
    assert.throws(() => estado().accionesPartidos.actualizarPartido(nuevo.id, { ...nuevo, equipo_visitante_id: 3 }), /eventos registrados/)
    estado().accionesEventos.eliminarEvento(evento.id)
    estado().accionesPartidos.eliminarPartido(nuevo.id)
    comprobarRelaciones()
  })
  await comprobar('eliminación de equipo y liga en una sola actualización coherente', () => {
    reiniciar()
    let avisos = 0
    const cancelar = store.subscribe(() => { avisos += 1; comprobarRelaciones() })
    estado().accionesEquipos.eliminarEquipo(1)
    assert.equal(avisos, 1)
    assert.ok(!estado().jugadores.some((jugador) => jugador.equipo_id === 1))
    estado().accionesLigas.eliminarLiga(2)
    assert.equal(avisos, 2)
    cancelar()
    assert.ok(!estado().noticias.some((noticia) => noticia.liga_id === 2))
    assert.ok(!estado().partidos.some((partido) => partido.liga_id === 2))
  })
  await comprobar('persist conserva entidades y restaura acciones sin contadores duplicados', async () => {
    reiniciar()
    const liga = estado().accionesLigas.crearLiga({ nombre: 'Persistida', temporada: '2026', estado: 'activa' })
    const contenido = memoria.get(CLAVE_DEMOSTRACION)
    const guardado = JSON.parse(contenido)
    assert.deepEqual(Object.keys(guardado.state).sort(), ['equipos', 'eventos', 'jugadores', 'ligas', 'noticias', 'partidos'])
    reiniciar()
    memoria.set(CLAVE_DEMOSTRACION, contenido)
    await store.persist.rehydrate()
    assert.ok(estado().ligas.some((item) => item.id === liga.id && item.nombre === 'Persistida'))
    const siguiente = estado().accionesLigas.crearLiga({ nombre: 'Siguiente', temporada: '2026', estado: 'activa' })
    assert.notEqual(siguiente.id, liga.id)
    assert.equal(typeof estado().accionesEventos.crearEvento, 'function')
    comprobarRelaciones()
  })
  await comprobar('almacenamiento inválido y campos inválidos conservan un estado utilizable', async () => {
    reiniciar()
    memoria.set(CLAVE_DEMOSTRACION, '{json inválido')
    await store.persist.rehydrate()
    assert.equal(estado().ligas.length, 3)
    memoria.set(CLAVE_DEMOSTRACION, JSON.stringify({ state: { ligas: 'inválido' }, version: 1 }))
    await store.persist.rehydrate()
    assert.equal(estado().ligas.length, 3)
    assert.throws(() => estado().accionesEquipos.crearEquipo(1, { nombre: ' ' }), /obligatorio/)
    assert.throws(() => estado().accionesEquipos.crearEquipo(1, { nombre: 'Equipo', escudo: 'https://ejemplo.invalid/imagen.png' }), /ruta local/)
    assert.throws(() => estado().accionesJugadores.crearJugador(9999, { nombre: 'Ejemplo' }), /No se encontró/)
  })
  await comprobar('aplicación sin HTTP, autenticación ni antiguas listas de memoria', async () => {
    async function revisar(carpeta) {
      for (const archivo of await readdir(carpeta, { withFileTypes: true })) {
        const ruta = `${carpeta}/${archivo.name}`
        if (archivo.isDirectory()) await revisar(ruta)
        else if (/\.(js|jsx|css)$/.test(archivo.name)) assert.doesNotMatch(await readFile(ruta, 'utf8'), /\baxios\b|\bfetch\s*\(|XMLHttpRequest|VITE_API_URL|beesocc_token|createContext|\buseContext\b|datosLocales|setEquipos\(|setJugadores\(|setPartidos\(|setNoticias\(/)
      }
    }
    await revisar('src')
  })
  console.log(`${comprobaciones} grupos correctos con Zustand y persist reales; sin Laravel ni MySQL.`)
} finally {
  await servidor.close()
  delete globalThis.localStorage
}


