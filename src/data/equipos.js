const nombres = ['Piendamo FC', 'Quilichao del Valle', 'Locos por el futbol', 'Deportivo Popayan', 'Bello Horizonte FC', 'Estrellas del Sur', 'Deportivo Independiente Popayan', 'Atlético Solidaridad', 'Robles FC', 'Lobos del Bosque', 'Deportivo Pino', 'Halcones Dorados']

export const equipos = nombres.map((nombre, indice) => ({
  id: indice + 1,
  liga_id: Math.floor(indice / 4) + 1,
  nombre,
  ciudad: ['Popayan', 'Santander de quilichao', 'Timbio', 'Piendamo'][indice % 4],
  escudo: null,
}))
