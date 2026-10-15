# BEESOCC Visual

BEESOCC Visual es una copia educativa del frontend de BEESOCC V1. Conserva sus
pantallas, componentes, colores, tarjetas, formularios, tablas y navegación, usando
exclusivamente datos ficticios locales. No es BEESOCC V2.

**No requiere Laravel, MySQL, Sanctum, cuentas, contraseñas, tokens ni una API.**
Los cambios de los formularios viven en memoria y se reinician al actualizar la
página. El encabezado identifica la demostración y Mis Ligas explica este comportamiento.

## Cómo ejecutar

Se comprobó con Node.js 22.18.0 y npm 10.9.3. Desde esta carpeta:

```sh
npm install
npm run dev -- --port 5175
```

Abre http://localhost:5175. No hace falta crear un archivo .env.
Para compilar y revisar el resultado:

```sh
npm run lint
npm run build
npm run preview -- --port 4175
```

La carpeta dist contiene la versión compilada. Al alojarla, el servidor debe
redirigir las rutas de la aplicación a index.html para permitir accesos directos.
La primera instalación de npm necesita acceso al registro de paquetes; la
aplicación instalada no consulta servicios externos para obtener datos.

## Herramientas y conceptos con ejemplos del proyecto

### React

React permite construir la interfaz a partir de funciones que describen lo que
se ve. Cuando cambia el estado de un formulario o una lista, React actualiza la
pantalla. App devuelve AppRoutes y cada ruta muestra una página.

### Vite

Vite inicia el servidor de desarrollo y prepara los archivos para publicación.
Su configuración está en vite.config.js, con el plugin de React. `npm run dev`
activa la recarga durante el desarrollo y `npm run build` genera dist.

### JSX

JSX permite escribir etiquetas de interfaz dentro de JavaScript. Por ejemplo,
DashboardLigaPage muestra el nombre de la liga con este código real:

```jsx
<h2>{liga.nombre}</h2>
```

Las llaves insertan una expresión JavaScript. Las clases CSS se escriben con
className. JSX se transforma durante el desarrollo y la compilación.

### Componentes y props

Un componente es una parte reutilizable de la interfaz. LigaCard muestra una
liga; EquipoForm contiene un formulario; Sidebar muestra la navegación.
Las props son los datos y las funciones que una página entrega a un componente.
MisLigasPage utiliza LigaCard así:

```jsx
<LigaCard key={liga.id} liga={liga} onAdministrar={administrarLiga} onEditar={abrirEdicion} onEliminar={borrarLiga} />
```

`liga` contiene los datos. Las funciones onAdministrar, onEditar y onEliminar
responden a los botones. `key` identifica cada tarjeta dentro de la lista.
Así, el componente visual no necesita conocer cómo se organizan los datos.

### useState

useState guarda información de la interfaz entre renderizados. En InicioPage:

```jsx
const [menuAbierto, setMenuAbierto] = useState(false)
```

menuAbierto decide si el menú está desplegado y setMenuAbierto actualiza ese
valor. En EquipoForm, otro useState guarda lo escrito en sus campos. En las
páginas, las listas también son estado local: guardar un equipo agrega el registro
al arreglo y setEquipos hace que aparezca la nueva tarjeta.

### useEffect

useEffect ejecuta una sincronización después de renderizar. Las páginas heredadas
lo utilizan para cargar una lista local al entrar o al cambiar el parámetro de la
URL. Por ejemplo, EquiposPage termina su efecto con:

```jsx
cargarEquipos()
return () => { activo = false }
```

El efecto depende de ligaId. La función de limpieza evita actualizar una pantalla
que ya se abandonó. Aunque algunas funciones conservan async/await, trabajan
solamente con arreglos de JavaScript: no hacen solicitudes de red ni consultan
una base de datos. Los botones y formularios cambian su estado desde sus manejadores
de eventos, sin necesitar efectos para cada interacción.

### React Router

React Router relaciona la URL con el componente que debe mostrarse. BrowserRouter
está en main.jsx y las rutas se declaran en routes/AppRoutes.jsx. Un ejemplo real:

```jsx
<Route path="equipos" element={<EquiposPage />} />
```

Esa ruta está dentro de `/ligas/:ligaId`. useParams obtiene ligaId; useNavigate
cambia de página y Link/NavLink permiten navegar. El layout comparte el objeto de
la liga con su página mediante Outlet y el mecanismo propio del router. No se
crearon providers de estado ni stores. Una liga inexistente muestra un mensaje claro.

### CSS y recursos visuales

src/index.css contiene todos los estilos y se importa desde main.jsx. Sus clases
controlan color, tipografía, distribución, espaciado, menús, formularios y tablas.
Las media queries adaptan la interfaz a pantallas pequeñas.
**El CSS es idéntico al de V1**, incluidas sus reglas responsive. Se conservaron
src/assets y public. Las noticias utilizan una imagen ya incluida en el proyecto;
los equipos y jugadores sin imagen muestran los mismos iconos de respaldo de V1.
Los campos de imagen aceptan rutas locales, por ejemplo `/favicon.svg`, para evitar
introducir dependencias de imágenes remotas.

### Qué pertenece a cada versión

| Herramienta | Esta copia visual | Proyecto original |
| --- | --- | --- |
| React, JSX, Vite, React Router, CSS | Sí | Sí |
| useState y useEffect | Sí, interacciones de interfaz | Sí |
| Datos ficticios JavaScript | Sí | Datos obtenidos de Laravel |
| Axios y variables de API | Retirados | Sí |
| Autenticación, tokens y Sanctum | No | Sí |
| Laravel y MySQL | No | Sí |
| Contextos de autenticación y liga | Retirados | Context API |
| Zustand | No | Solo la copia frontend-zustand lo utiliza |

No se instalaron bibliotecas adicionales para datos, formularios o estado.
Oxlint se conserva para revisar el código; Node.js y npm ejecutan las herramientas.

## Datos locales y operaciones simuladas

Los ejemplos están separados en src/data:

| Archivo | Contenido |
| --- | --- |
| competiciones.js | 3 ligas ficticias |
| equipos.js | 12 equipos, cuatro por liga |
| jugadores.js | 48 jugadores inventados, cuatro por equipo |
| partidos.js | 12 partidos: finalizados, en curso y pendientes |
| eventos.js | 57 eventos coherentes con los jugadores y partidos |
| noticias.js | 9 noticias ficticias, tres por liga |
| estadisticas.js | Funciones de clasificación y estadísticas a partir de los ejemplos |

Los IDs relacionan cada jugador con su equipo y cada equipo con su liga. Los
partidos relacionan dos equipos de la misma liga. Los goles del marcador proceden
de los eventos; la tabla cuenta solo partidos finalizados y las estadísticas
resumen los eventos registrados, incluidos los partidos en curso.

Para que una edición siga disponible al pasar de Equipos a Partidos, los servicios
necesitan leer la misma copia de los datos. Esa es la única información compartida:
**datosLocales.js contiene una copia sencilla en memoria**, no un store de React.
Cada página administra su interfaz con useState y entrega datos mediante props.
No hay suscripciones globales, Context API, Zustand ni persistencia en localStorage.

Los archivos de services conservan nombres como obtenerEquipos o crearNoticia para
reutilizar los formularios y páginas originales. respuestaLocal devuelve un objeto
`{ data: ... }` con una copia del resultado; este formato es un objeto JavaScript,
no una respuesta HTTP. Se validan campos obligatorios, dorsales repetidos,
participantes y relaciones. Los mensajes se muestran con ErroresFormulario.

Al borrar una liga o un equipo, se limpian sus registros relacionados para evitar
referencias huérfanas. Eliminar un jugador conserva sus eventos sin jugador.
Recargar el navegador vuelve a los ejemplos iniciales. Ningún botón escribe en
una base de datos ni afirma hacerlo.

## Rutas públicas

- `/`: página de inicio y menú público.
- `/mis-ligas`: tarjetas, selección y formulario de ligas.
- `/ligas/:ligaId/dashboard`: accesos a los módulos.
- `/ligas/:ligaId/equipos`: equipos y formularios.
- `/ligas/:ligaId/jugadores`: selector de equipo, planteles y formularios.
- `/ligas/:ligaId/partidos`: calendario, filtro de estados y formularios.
- `/ligas/:ligaId/en-vivo`: selector, marcador, eventos y línea de tiempo.
- `/ligas/:ligaId/noticias`: noticias, búsqueda y formularios.
- `/ligas/:ligaId/tabla`: clasificación.
- `/ligas/:ligaId/estadisticas`: pestañas de jugadores y equipos.

Ejemplos: `/ligas/1/jugadores?equipo=1` y `/ligas/1/en-vivo?partido=3`.
Las páginas Login y Registro y sus rutas se retiraron. Todos sus enlaces conducen
ahora a la demostración. Volver al inicio sustituye al antiguo cierre de sesión.

## Organización y archivos

```text
frontend-visual/
  public/
  src/
    assets/
    components/
    data/
    layouts/
    pages/
    routes/
    services/
    App.jsx
    main.jsx
    index.css
  scripts/verificar-demo.mjs
  docs/
  index.html
  package.json
  package-lock.json
  vite.config.js
  README.md
```

Se conservaron las carpetas originales cuando seguían siendo útiles; no hizo falta
crear hooks o mover el CSS a una carpeta nueva. No se copiaron node_modules, dist,
.env, cachés ni archivos temporales del frontend original. node_modules y dist se
generan en esta copia mediante instalación y compilación.

Archivos añadidos respecto a V1: los siete archivos de data, services/datosLocales.js,
scripts/verificar-demo.mjs y las evidencias de docs.

Archivos adaptados: main.jsx, routes/AppRoutes.jsx, layouts/DashboardLayout.jsx,
pages/InicioPage.jsx y MisLigasPage.jsx; las páginas de los módulos para sus mensajes
y datos locales; components/HeaderDashboard.jsx y Sidebar.jsx; las etiquetas de
imagen en EquipoForm, JugadorForm y NoticiaForm; todos los servicios; package.json,
package-lock.json, index.html y este README. App.jsx, el dashboard, las tarjetas,
las tablas y las estructuras visuales de los módulos se conservaron.

Se retiraron únicamente de esta copia: api.js, los seis archivos de context,
RutaProtegida.jsx, RutaPublica.jsx, LoginPage.jsx y RegistroPage.jsx.
**backend, frontend y frontend-zustand permanecen intactos.**

## Pruebas realizadas

```sh
npm install
npm run lint
npm run build
node scripts/verificar-demo.mjs
```

- Instalación completada. Axios no figura en las dependencias de la copia.
- Lint sin errores ni advertencias tras corregir la limpieza del selector de partido.
- Build correcto, con todos los módulos e imágenes locales resueltos.
- Doce grupos de pruebas automatizadas: relaciones de datos, contenido de las tres
  ligas, tabla y marcador, aislamiento de copias, operaciones de ligas/equipos,
  jugadores y dorsales, noticias y búsqueda, eventos y autogoles, partidos y estados,
  errores y rechazo de imágenes externas, eliminación relacionada y ausencia de
  clientes HTTP/tokens/stores globales en src.
- En navegador: inicio, acceso a Mis Ligas, selección de liga, dashboard y rutas de
  los siete módulos; jugadores, partidos, noticias, clasificación y estadísticas
  mostraron sus ejemplos. En vivo mostró el marcador 1-1 y la línea de tiempo del
  partido 3. Se abrió y completó un formulario de equipo y apareció la nueva tarjeta.
- Se comprobó el menú móvil y se capturaron vistas a 390×844 y 1366×900. El tamaño
  temporal del navegador se restauró después. Capturas: docs/demo-movil.jpg y
  docs/demo-dashboard.jpg. Esto es una revisión de muestra, no una certificación
  visual de todas las páginas en todos los tamaños.
- Comparación SHA-256: 467 archivos verificados de backend, frontend y
  frontend-zustand sin cambios, excluyendo dependencias y artefactos generados.
  El CSS de la copia coincide byte por byte con V1.
- La revisión de src y las pruebas confirman que las funciones de datos no contienen
  clientes ni llamadas HTTP al backend. No se capturó un archivo HAR del navegador.

Las operaciones de datos se probaron con los servicios locales reales, sin mocks
de Laravel. No se comprobó cada botón de cada formulario en el navegador; las
operaciones restantes están cubiertas por las pruebas de servicios indicadas.
La instalación informó una alerta alta en una dependencia de desarrollo heredada;
no impidió lint ni build y no se aplicó una actualización general de dependencias.

Para repetir la prueba de restauración, crea un equipo y recarga la página: debe
volver a aparecer la lista inicial. Para la liga inexistente, abre
`/ligas/999/dashboard`; debe mostrar el mensaje y el botón Volver a Mis Ligas.
