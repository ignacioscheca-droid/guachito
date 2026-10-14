// Paucho's room: 16 places, three options each (the owner's list, Claude Doc "Gauchito — El
// cuarto de Paucho: todo el arte"). Option k of a place is cut from ChatGPT's cuarto_k
// (design/tools/import_room.py): 1 plain, 2 better, 3 the estancia's. Most cost herraduras;
// some come from the trip to the south or from friendship, and six are Gauchito Premium's
// (they still cost herraduras).

import { LEVELS } from './friendship'

export type RoomTab = 'cama' | 'mesa' | 'pared' | 'ventana' | 'piso'

export const ROOM_TABS: { id: RoomTab; name: string; icon: string }[] = [
  { id: 'cama', name: 'Cama', icon: 'ui_tab_cama' },
  { id: 'mesa', name: 'Mesa', icon: 'ui_tab_mesa' },
  { id: 'pared', name: 'Paredes', icon: 'ui_tab_pared' },
  { id: 'ventana', name: 'Ventana', icon: 'ui_tab_ventana' },
  { id: 'piso', name: 'Piso', icon: 'ui_tab_piso' },
]

export type RoomSource =
  | { kind: 'coins'; price: number }
  | { kind: 'premium'; price: number }
  | { kind: 'south' }
  | { kind: 'friend'; level: string }

export type RoomOption = { id: string; slot: string; k: 1 | 2 | 3; name: string; source: RoomSource }

export type RoomSlot = { id: string; name: string; tab: RoomTab; options: RoomOption[]; needsDog?: boolean }

const coins = (price: number): RoomSource => ({ kind: 'coins', price })
const premium = (price: number): RoomSource => ({ kind: 'premium', price })
const south: RoomSource = { kind: 'south' }
const friend = (level: string): RoomSource => ({ kind: 'friend', level })

function slot(id: string, name: string, tab: RoomTab, opts: [string, RoomSource][], needsDog = false): RoomSlot {
  return { id, name, tab, needsDog, options: opts.map(([n, source], i) => ({ id: `${id}_${i + 1}`, slot: id, k: (i + 1) as 1 | 2 | 3, name: n, source })) }
}

export const ROOM_SLOTS: RoomSlot[] = [
  slot('cama', 'Cama', 'cama', [['Catre', coins(30)], ['Cama con matra', coins(140)], ['Cama de estancia', premium(260)]]),
  slot('pie', 'Pie de la cama', 'cama', [['Cajón con manta', coins(40)], ['Baúl de madera', coins(100)], ['Baúl de cuero', south]]),
  slot('calzado', 'Calzado', 'cama', [['Alpargatas', coins(20)], ['Botas de cuero', coins(60)], ['Botas de potro', friend('Amigos')]]),
  slot('mesa', 'Mesa', 'mesa', [['Mesa de tablones', coins(50)], ['Mesa con mantel', coins(120)], ['Mesa de truco', premium(250)]]),
  slot('mesa_top', 'Sobre la mesa', 'mesa', [['Mate y termo', coins(30)], ['Cartas de truco', coins(50)], ['La libreta', friend('Compañeros')]]),
  slot('asiento', 'Asiento', 'mesa', [['Banquito', coins(30)], ['Silla de paja', coins(90)], ['Mecedora', premium(220)]]),
  slot('estante', 'Estante', 'pared', [['Potus', coins(40)], ['Caballito y libros', coins(60)], ['Gramófono', premium(240)]]),
  slot('pared', 'Sobre la cama', 'pared', [['Guitarra', coins(80)], ['Bombo legüero', coins(120)], ['Acordeón', coins(180)]]),
  slot('reloj', 'Reloj', 'pared', [['Almanaque', coins(30)], ['Reloj redondo', coins(100)], ['Reloj de péndulo', premium(240)]]),
  slot('cuadro', 'Cuadro', 'pared', [['Molino', coins(50)], ['Tejido pampa', coins(80)], ['Postales del sur', south]]),
  slot('perchero', 'Perchero', 'pared', [['Clavo con sombrero', coins(20)], ['Perchero', coins(80)], ['Perchero con boleadoras', friend('Compadres')]]),
  slot('ventana_bajo', 'Bajo la ventana', 'ventana', [['Cajones con vela', coins(30)], ['Aparador', coins(120)], ['Cómoda fileteada', coins(200)]]),
  slot('cortinas', 'Cortinas', 'ventana', [['Arpillera', coins(30)], ['Postigos verdes', coins(100)], ['Cortinas de telar', coins(160)]]),
  slot('alfeizar', 'Alféizar', 'ventana', [['Malvón', coins(30)], ['Cactus en lata', coins(40)], ['Michi, el gatito', premium(300)]]),
  slot('alfombra', 'Alfombra', 'piso', [['Cuero de vaca', coins(60)], ['Alfombra pampa', coins(120)], ['Lana de oveja', south]]),
  slot('plato', 'Plato del perro', 'piso', [['Plato de lata', coins(20)], ['Bowl de barro', coins(50)], ['Bowls con base', coins(90)]], true),
]

export const roomOption = (id: string) => ROOM_SLOTS.flatMap((s) => s.options).find((o) => o.id === id)

/** The first purchase, forced the day the casita opens. */
export const FIRST_BED = 'cama_1'

/** What an option costs in herraduras (0: it is given, once its trip or friendship arrives). */
export const priceOf = (o: RoomOption) => (o.source.kind === 'coins' || o.source.kind === 'premium' ? o.source.price : 0)

export const friendDays = (level: string) => LEVELS.find((l) => l.name === level)?.days ?? Infinity

/** The picture of an option in the shop: its thumbnail, or the loose sprite for the ones that move or sit on another. */
export function optionArt(o: RoomOption) {
  if (o.slot === 'mesa_top') return ['room_top_mate', 'room_top_cartas', 'room_top_libreta'][o.k - 1]
  if (o.id === 'alfeizar_3') return 'michi_sentado'
  return `thumb_${o.id}`
}

/** The old build's six things, refunded when a save from it loads (the bed is kept as the catre). */
export const LEGACY_ROOM: Record<string, number> = { matra: 40, mesita: 50, baul: 60, cuadro: 70, estante: 80 }
