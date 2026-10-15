import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createServer } from 'vite'

const servidor = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
let comprobaciones = 0
async function comprobar(nombre, prueba) {
  await prueba()
  comprobaciones += 1
  console.log(`OK ${nombre}`)
}

try {
  const cargar = (archivo) => servidor.ssrLoadModule(`/src/services/${archivo}.js`)
  const { datosLocales } = await cargar('datosLocales')
  const ligas = await cargar('ligaService')
  const equipos = await cargar('equipoService')
  const jugadores = await cargar('jugadorService')
  const partidos = await cargar('partidoService')
  const eventos = await cargar('eventoService')
  const noticias = await cargar('noticiaService')
  const estadisticas = await cargar('estadisticaService')
  const { obtenerTablaPosiciones } = await cargar('tablaPosicionesService')

  await comprobar('datos iniciales y relaciones coherentes', () => {
    assert.equal(datosLocales.ligas.length, 3)
    assert.equal(datosLocales.equipos.length, 12)
    assert.equal(datosLocales.jugadores.length, 48)
    assert.equal(datosLocales.partidos.length, 12)
    for (const equipo of datosLocales.equipos) assert.ok(datosLocales.ligas.some((liga) => liga.id === equipo.liga_id))
    for (const jugador of datosLocales.jugadores) assert.ok(datosLocales.equipos.some((equipo) => equipo.id === jugador.equipo_id))
    for (const partido of datosLocales.partidos) {
      for (const id of [partido.equipo_local_id, partido.equipo_visitante_id]) assert.ok(datosLocales.equipos.some((equipo) => equipo.id === id && equipo.liga_id === partido.liga_id))
    }
    for (const evento of datosLocales.eventos) {
      const partido = datosLocales.partidos.find((item) => item.id === evento.partido_id)
      assert.ok([partido.equipo_local_id, partido.equipo_visitante_id].includes(evento.equipo_id))
      assert.ok(datosLocales.jugadores.some((jugador) => jugador.id === evento.jugador_id && jugador.equipo_id === evento.equipo_id))
    }
  })
  await comprobar('tres ligas con datos en todos los módulos', async () => {
    for (const liga of (await ligas.obtenerLigas()).data.ligas) {
      assert.equal((await equipos.obtenerEquipos(liga.id)).data.equipos.length, 4)
      assert.equal((await partidos.obtenerPartidos(liga.id)).data.partidos.length, 4)
      assert.equal((await noticias.obtenerNoticias(liga.id)).data.noticias.length, 3)
      assert.equal((await obtenerTablaPosiciones(liga.id)).data.tabla.length, 4)
      for (const [funcion, campo] of [['obtenerGoleadores', 'goles'], ['obtenerAsistencias', 'asistencias'], ['obtenerAmarillas', 'amarillas'], ['obtenerRojas', 'rojas'], ['obtenerFaltas', 'faltas'], ['obtenerEstadisticasEquipos', 'equipos']]) assert.ok((await estadisticas[funcion](liga.id)).data[campo].length)
    }
  })
  await comprobar('tabla y marcadores calculados desde eventos', async () => {
    const tabla = (await obtenerTablaPosiciones(1)).data.tabla
    assert.deepEqual(tabla.map(({ nombre, pts }) => [nombre, pts]), [['Aurora FC', 3], ['Águilas Verdes', 1], ['Deportivo Brisa', 1], ['Tigres del Valle', 0]])
    assert.deepEqual((await partidos.obtenerPartido(1)).data.partido.equipos.map((equipo) => equipo.goles_marcados), [2, 1])
    assert.equal(tabla.reduce((total, fila) => total + fila.gf, 0), tabla.reduce((total, fila) => total + fila.gc, 0))
  })
  await comprobar('consultas aisladas de la memoria original', async () => {
    const copia = (await equipos.obtenerEquipos(1)).data.equipos
    copia[0].nombre = 'No debe persistir'
    assert.equal((await equipos.obtenerEquipo(1)).data.equipo.nombre, 'Aurora FC')
  })
  let ligaNueva
  let equipoNuevo
  await comprobar('crear y editar liga y equipo', async () => {
    ligaNueva = (await ligas.crearLiga({ nombre: 'Liga temporal', temporada: '2026', estado: 'activa' })).data.liga
    await ligas.actualizarLiga(ligaNueva.id, { ...ligaNueva, nombre: 'Liga de prueba' })
    equipoNuevo = (await equipos.crearEquipo(ligaNueva.id, { nombre: 'Equipo de prueba' })).data.equipo
    await equipos.actualizarEquipo(equipoNuevo.id, { nombre: 'Equipo editado' })
    assert.equal((await ligas.obtenerLiga(ligaNueva.id)).data.liga.nombre, 'Liga de prueba')
    assert.equal((await equipos.obtenerEquipo(equipoNuevo.id)).data.equipo.nombre, 'Equipo editado')
  })
  await comprobar('jugadores, dorsal duplicado y eliminación', async () => {
    const datos = { nombre: 'Jugador', apellido: 'Inventado', dorsal: 9, posicion: 'delantero' }
    const jugador = (await jugadores.crearJugador(equipoNuevo.id, datos)).data.jugador
    await assert.rejects(jugadores.crearJugador(equipoNuevo.id, datos), /dorsal/)
    await jugadores.actualizarJugador(jugador.id, { ...datos, dorsal: 10 })
    assert.equal((await jugadores.obtenerJugador(jugador.id)).data.jugador.dorsal, 10)
    await jugadores.eliminarJugador(jugador.id)
    assert.equal((await jugadores.obtenerJugadores(equipoNuevo.id)).data.jugadores.length, 0)
  })
  await comprobar('búsqueda, edición y eliminación de noticias', async () => {
    const datos = { titulo: 'Prueba de búsqueda local', contenido: 'Una noticia ficticia.', fecha_publicacion: '2026-10-15' }
    const noticia = (await noticias.crearNoticia(1, datos)).data.noticia
    assert.equal((await noticias.obtenerNoticias(1, 'BÚSQUEDA LOCAL')).data.noticias.length, 1)
    await noticias.actualizarNoticia(noticia.id, { ...datos, titulo: 'Noticia editada' })
    assert.equal((await noticias.obtenerNoticia(noticia.id)).data.noticia.titulo, 'Noticia editada')
    await noticias.eliminarNoticia(noticia.id)
    assert.equal((await noticias.obtenerNoticias(1, 'Noticia editada')).data.noticias.length, 0)
  })
  await comprobar('eventos actualizan marcador y estadísticas; autogol válido', async () => {
    const datos = { equipo_id: 1, jugador_id: 4, tipo: 'gol', minuto: 50 }
    const evento = (await eventos.crearEvento(3, datos)).data.evento
    assert.equal((await partidos.obtenerPartido(3)).data.partido.equipos[0].goles_marcados, 2)
    await eventos.actualizarEvento(evento.id, { ...datos, tipo: 'autogol', jugador_id: 12 })
    assert.equal((await partidos.obtenerPartido(3)).data.partido.equipos[0].goles_marcados, 2)
    await eventos.eliminarEvento(evento.id)
    assert.equal((await partidos.obtenerPartido(3)).data.partido.equipos[0].goles_marcados, 1)
    await assert.rejects(eventos.crearEvento(3, { ...datos, jugador_id: 8 }), /jugador/)
    await assert.rejects(eventos.crearEvento(1, datos), /en curso/)
  })
  await comprobar('partidos, estados y validación de liga y participantes', async () => {
    const datos = { equipo_local_id: 1, equipo_visitante_id: 2, jornada: 3, fecha: '2026-10-20', hora: '14:00', estado: 'pendiente' }
    const partido = (await partidos.crearPartido(1, datos)).data.partido
    await partidos.actualizarPartido(partido.id, { ...datos, estado: 'en_curso' })
    const evento = (await eventos.crearEvento(partido.id, { equipo_id: 1, jugador_id: 4, tipo: 'gol', minuto: 7 })).data.evento
    await partidos.actualizarPartido(partido.id, { ...datos, estado: 'finalizado' })
    assert.equal((await obtenerTablaPosiciones(1)).data.tabla.find((fila) => fila.equipo_id === 1).pts, 6)
    await partidos.eliminarPartido(partido.id)
    assert.ok(!datosLocales.eventos.some((item) => item.id === evento.id))
    await assert.rejects(partidos.crearPartido(1, { ...datos, equipo_visitante_id: 1 }), /diferentes/)
    await assert.rejects(partidos.crearPartido(1, { ...datos, equipo_visitante_id: 5 }), /esta liga/)
  })
  await comprobar('recursos inválidos y rutas de imagen externas rechazados', async () => {
    await assert.rejects(ligas.obtenerLiga(999999), /No se encontró/)
    await assert.rejects(equipos.crearEquipo(1, { nombre: ' ' }), /obligatorio/)
    await assert.rejects(equipos.crearEquipo(1, { nombre: 'Equipo', escudo: 'https://ejemplo.invalid/imagen.png' }), /ruta local/)
  })
  await comprobar('eliminar liga limpia sus registros relacionados', async () => {
    await ligas.eliminarLiga(ligaNueva.id)
    assert.ok(!datosLocales.equipos.some((equipo) => equipo.liga_id === ligaNueva.id))
    await assert.rejects(equipos.obtenerEquipo(equipoNuevo.id), /No se encontró/)
  })
  await comprobar('código sin clientes HTTP, tokens ni estado global React', async () => {
    async function revisar(carpeta) {
      for (const archivo of await readdir(carpeta, { withFileTypes: true })) {
        const ruta = `${carpeta}/${archivo.name}`
        if (archivo.isDirectory()) await revisar(ruta)
        else if (/\.(js|jsx|css)$/.test(archivo.name)) assert.doesNotMatch(await readFile(ruta, 'utf8'), /\baxios\b|\bfetch\s*\(|XMLHttpRequest|VITE_API_URL|beesocc_token|localStorage|createContext|useContext|zustand/)
      }
    }
    await revisar('src')
  })
  console.log(`${comprobaciones} grupos de comprobaciones correctos, sin Laravel ni MySQL.`)
} finally {
  await servidor.close()
}

