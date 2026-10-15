<<<<<<< HEAD
EQUIPO BEESOCC

Roni Cuellar - Santiago Gomez - Yisela Cuetia - Jorge Alzate - Eduardo Camacho
=======
# BEESOCC Visual con Zustand

Demostración de React + Zustand basada en la interfaz de BEESOCC V1. Conserva
sus rutas, componentes, CSS, imágenes y diseño responsive. Trabaja con los datos
que ya existían en esta carpeta: Liga Cauca, Copa Horizonte y Liga del Valle.

No utiliza Laravel, MySQL, autenticación, tokens, Axios ni solicitudes HTTP de datos.
No implementa funciones de BEESOCC V2.

## Ejecutar

Desde frontend-visual, con Node.js 22.18.0 y npm 10.9.3 o un entorno compatible:

```sh
npm install
npm run dev -- --port 5175
```

Abre http://localhost:5175. No se necesita .env ni iniciar el backend.

```sh
npm run lint
npm run build
npm run preview -- --port 4175
node scripts/verificar-demo.mjs
```

Vite genera dist para publicación. El alojamiento debe redirigir las rutas del
frontend a index.html para permitir abrir directamente un dashboard.
La instalación inicial descarga paquetes npm; la aplicación no obtiene información
de servicios externos. Vite sirve los archivos locales y usa su conexión de recarga
en desarrollo. Eso es independiente de la gestión de datos de la demostración.

## Qué se aprende con este proyecto

- **React** construye las pantallas como componentes y actualiza lo que cambia.
- **Vite** ejecuta el servidor de desarrollo y genera los archivos de publicación.
- **JSX** permite describir la interfaz desde JavaScript: DashboardLigaPage muestra
  `<h2>{liga.nombre}</h2>` usando un valor recibido de la ruta.
- **Componentes** como EquipoCard, LigaForm y Sidebar se reutilizan en las páginas.
- **Props** entregan datos y manejadores a esos componentes. EquiposPage pasa
  `equipo={equipo}` y `onEditar={abrirEdicion}` a EquipoCard.
- **useState** mantiene los valores de un formulario, el menú abierto, la pestaña,
  los mensajes de validación y los filtros: son controles de una pantalla.
- **useEffect** sirve para sincronizaciones después de renderizar. Se retiraron los
  efectos que cargaban listas locales: Zustand ya avisa a React cuando cambian.
  No hacen falta efectos de carga, temporizadores ni consultas de datos.
- **React Router** conecta las URLs con las páginas. useParams obtiene ligaId;
  Link y useNavigate permiten navegar; Outlet conserva el layout compartido.
- **CSS** controla los colores, tarjetas, tablas, espaciados y media queries de
  V1. src/index.css se sigue importando desde main.jsx y no se modificó.
- **Zustand** mantiene los datos compartidos y sus acciones de modificación.
- **persist** conserva esos datos de demostración en el navegador al actualizar.

## Estado local y estado global

| Información | Ubicación | Motivo |
| --- | --- | --- |
| Ligas, equipos y jugadores | Zustand | Los consultan varias páginas y formularios |
| Partidos y eventos | Zustand | Alimentan calendario, marcador, tabla y estadísticas |
| Noticias | Zustand | La lista, búsqueda y edición deben usar los mismos registros |
| Campos de formularios | useState | Son borradores hasta pulsar Guardar |
| Menú, filtros y pestañas | useState | Solo afectan a la interfaz actual |
| Liga y partido seleccionados | URL | Conserva las rutas y enlaces directos existentes |
| Marcadores, tabla y estadísticas | Funciones derivadas | Se calculan sin guardar copias desincronizadas |

Se utiliza **un solo store**, useBeesoccStore, con acciones organizadas en cinco
archivos de dominio. Los eventos pertenecen al dominio de partidos. Separar estos
datos en stores independientes exigiría coordinar borrados, persistencia y
suscripciones entre ellos. Aquí una sola actualización puede eliminar un equipo,
sus jugadores, sus partidos y sus eventos coherentemente.

## Datos de ejemplo existentes

src/data no se modificó. Contiene competiciones.js, equipos.js, jugadores.js,
partidos.js, eventos.js, noticias.js y estadisticas.js. Los registros iniciales son:
3 ligas, 12 equipos, 48 jugadores, 12 partidos, 57 eventos y 9 noticias.

crearDatosIniciales copia esos datos al crear el store. No se modifican los arrays
originales de los archivos de ejemplo. Los registros se relacionan mediante IDs:
equipo.liga_id, jugador.equipo_id y evento.partido_id, entre otros.
No se guardan objetos completos de equipos dentro de cada partido. El selector
completarPartido resuelve los participantes con sus nombres actuales y cuenta los
goles de los eventos. La clasificación incluye solo partidos finalizados; las
estadísticas conservan el cálculo existente a partir de los eventos.

## Cómo se utiliza Zustand: ejemplos reales

### Leer una colección

EquiposPage se suscribe al arreglo estable del store y filtra durante el render:

```jsx
const equiposGuardados = useBeesoccStore((estado) => estado.equipos)
const equipos = equiposGuardados.filter((equipo) => mismoId(equipo.liga_id, ligaId))
```

No existe un segundo useState para esa lista. Cuando cambia estado.equipos, React
vuelve a renderizar la página. Los filtros que crean nuevos arreglos se calculan
fuera del selector del hook, evitando snapshots nuevos en cada lectura de Zustand.

### Ejecutar una acción

La misma página obtiene las acciones del dominio:

```jsx
const { crearEquipo, actualizarEquipo, eliminarEquipo } = useBeesoccStore(
  (estado) => estado.accionesEquipos,
)
```

El formulario llama a guardarEquipo; este ejecuta crearEquipo(ligaId, datos) o
actualizarEquipo(id, datos). Las validaciones están en el store para que se cumplan
desde cualquier pantalla. Si fallan, la acción lanza Error y la página muestra su
mensaje con ErroresFormulario. No hay promesas de una API ni peticiones de red.

### Mantener borradores locales

EquipoForm conserva su estado de campos con useState. Cancelar descarta el borrador
sin modificar Zustand. Guardar envía los datos al manejador recibido por props.
El ID del registro que se está editando también es estado local de la página; el
objeto se consulta en el store, sin mantener una copia global independiente.

### Calcular resultados relacionados

TablaPosicionesPage se suscribe a equipos, partidos y eventos, y deriva:

```jsx
const tabla = seleccionarTabla({ equipos, partidos, eventos }, ligaId)
```

EstadisticasPage utiliza seleccionarEstadistica con la categoría activa. No conserva
una caché de resultados que pueda quedar obsoleta. PartidoEnVivoPage utiliza las
mismas entidades para la línea de tiempo y el marcador. EventoForm consulta los
jugadores del store para que su selector refleje las modificaciones del plantel.

### Actualizaciones inmutables y coherentes

Las acciones sustituyen arreglos y registros con map, filter y spread. No mutan el
estado anterior con push, splice u Object.assign. Por ejemplo, eliminarJugador
actualiza jugadores y pone a null su referencia en los eventos dentro del mismo set.
Eliminar un equipo o una liga aplica el borrado relacionado en una sola actualización.
Así, los suscriptores no observan registros huérfanos entre dos cambios del store.

## Persistencia de la demostración

persist se aplica una sola vez al store combinado. Utiliza la clave
`beesocc_visual_datos_v1`, versión 1, con createJSONStorage y localStorage.
partialize conserva únicamente las seis colecciones de entidades. No persiste
funciones, menús, errores, filtros, borradores ni resultados calculados.

Al cargar la aplicación se recuperan los datos guardados en ese origen del navegador.
Si no existen, se utilizan los ejemplos actuales de src/data. merge acepta la
estructura básica de colecciones y preserva las acciones originales. Un JSON
ilegible o una estructura incompatible deja disponibles los datos iniciales.
Esta comprobación básica es suficiente para la demostración; no es un validador
completo de información manipulada externamente.

Los IDs nuevos se calculan desde la colección actual, incluidos los datos
recuperados; no hay un contador separado que se reinicie al actualizar.
Distintos puertos u orígenes tienen almacenamientos independientes.

Para volver a los ejemplos, elimina únicamente `beesocc_visual_datos_v1` en el
almacenamiento local de las herramientas del navegador y recarga. Las otras
versiones de BEESOCC no usan esta clave. Los cambios se conservan localmente,
sin guardarse en una base de datos.

Referencia oficial de las funciones utilizadas:
[create](https://zustand.docs.pmnd.rs/reference/apis/create) y
[persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist).

## Reglas básicas

- Un partido requiere equipos diferentes pertenecientes a su liga.
- Los dorsales no pueden repetirse dentro del mismo equipo; sí en equipos distintos.
- Los jugadores de un evento deben corresponder al equipo seleccionado. En un
  autogol, el equipo es el beneficiado y el jugador pertenece al rival.
- Solo se pueden modificar eventos en partidos en curso.
- Cambiar los participantes de un partido con eventos registrados se rechaza para
  conservar la relación de esos eventos. Se pueden editar fecha, jornada y estado.
- Se validan campos requeridos, jornadas, minutos y posiciones.
- Los campos de imagen admiten rutas locales y rechazan direcciones externas.
- Eliminar un jugador conserva sus eventos sin jugador. Eliminar partidos,
  equipos o ligas retira sus registros relacionados.

## Rutas conservadas

`/`, `/mis-ligas`, y bajo `/ligas/:ligaId/`:
`dashboard`, `equipos`, `jugadores`, `partidos`, `en-vivo`, `noticias`, `tabla`,
`estadisticas`. Se conserva la redirección del índice a dashboard y la ruta comodín.

Ejemplos: `/ligas/1/jugadores?equipo=1` y `/ligas/1/en-vivo?partido=3`.
La URL identifica la competición. Una liga inexistente presenta el mensaje y el
botón de retorno originales. Un partido ajeno a la liga de la URL no se muestra.
No hay rutas de autenticación ni providers propios de Context API.

## Archivos y organización

```text
src/
  assets/                   # recursos existentes, sin cambios
  components/               # componentes y formularios conservados
  data/                     # ejemplos existentes, sin cambios
  layouts/DashboardLayout.jsx
  pages/                    # listas y acciones conectadas a Zustand
  routes/                   # rutas existentes, sin cambios
  services/errores.js        # presentación de errores locales
  stores/
    beesoccStore.js          # store combinado y persistencia
    ligasSlice.js            # acciones de ligas
    equiposSlice.js          # acciones de equipos
    jugadoresSlice.js        # acciones de jugadores
    partidosSlice.js         # acciones de partidos y eventos
    noticiasSlice.js         # acciones de noticias
    selectores.js            # datos derivados para las pantallas
    utilidades.js            # validaciones y operaciones inmutables comunes
  App.jsx
  main.jsx
  index.css
scripts/verificar-demo.mjs
```

Se añadieron los ocho archivos de stores. Se modificaron EquiposPage,
JugadoresPage, MisLigasPage, NoticiasPage, PartidosPage, PartidoEnVivoPage,
TablaPosicionesPage, EstadisticasPage, EventoForm y DashboardLayout, además de
package.json, package-lock.json, las pruebas y este README.

Se retiraron datosLocales.js y los servicios de datos que mantenían la antigua
memoria compartida. Sus acciones y consultas ahora están en los stores y selectores.
App, main, rutas, la página de inicio, el dashboard, los demás componentes,
los datos de ejemplo, CSS y recursos gráficos se conservaron.
No se instalaron otras bibliotecas además de Zustand.

## Verificación

Las pruebas utilizan Zustand y persist reales con un almacenamiento aislado en
memoria; no alteran los datos del navegador. Incluyen once grupos:

1. Datos iniciales actuales y relaciones entre entidades.
2. Render de 29 rutas y variantes, incluidas las tres ligas, liga inexistente y
   partido de otra competición, sin backend ni autenticación.
3. Suscripciones e inmutabilidad al editar equipos y sus pantallas relacionadas.
4. Creación, edición y borrado de ligas, equipos y noticias.
5. Dorsales únicos, cambios de jugador y conservación de eventos al retirarlo.
6. Eventos que actualizan marcador, calendario, clasificación y estadísticas.
7. Validaciones de partidos, autogoles y participantes sin mutar datos ante errores.
8. Eliminación coherente de equipos y ligas en una sola notificación.
9. Persistencia, rehidratación, acciones y generación de IDs después de recuperar.
10. Almacenamiento inválido y campos inválidos.
11. Ausencia de HTTP, autenticación y antiguas listas duplicadas en src.

En navegador se comprobó crear un equipo, recuperarlo después de recargar, crear
un jugador y rechazar otro con el mismo dorsal. Se editó un gol existente como
falta: el marcador cambió de 1-1 a 0-1 tanto en vivo como en el calendario y se
actualizaron los goleadores. La modificación se mantuvo al recargar. Después se
restauró el gol y se retiraron el equipo y el jugador temporales.

La automatización del navegador no completó los controles nativos de fecha/hora
del formulario de partido y se interrumpió al gestionar un diálogo de confirmación.
La lógica de creación y borrado de partidos y las eliminaciones relacionadas sí se
verificaron en las pruebas del store. No se afirma haber probado cada formulario
y control en todos los tamaños. Las capturas de esta adaptación se guardan en docs
con prefijo zustand; las evidencias anteriores describen la versión previa.

Se ejecutaron npm install, npm run lint, npm run build y el script de pruebas.
Los resultados y la comparación de integridad se registran en
`docs/zustand-verificacion.json`. La instalación sigue informando una alerta alta
heredada en una dependencia de desarrollo; no se aplicaron actualizaciones ajenas
a esta migración.
>>>>>>> b2fcb31 (beesocc con zustand)
