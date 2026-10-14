// Clothes for Paucho, bought with herraduras in the casita's shop (the room's things are in
// room.ts). Prices make one thing affordable about every day or two (30 for the full bar and
// 5 for each habit after it).

export type Slot = 'cabeza' | 'cuello' | 'cuerpo'
export const SLOTS: { id: Slot; name: string; usual: string }[] = [
  { id: 'cabeza', name: 'Cabeza', usual: 'Su sombrero' },
  { id: 'cuello', name: 'Cuello', usual: 'Su pañuelo rojo' },
  { id: 'cuerpo', name: 'Cuerpo', usual: 'Su poncho' },
]

export type Clothes = {
  id: string
  name: string
  slot: Slot
  price: number
  /** Placeholder until the icon art: an emoji or a colour swatch. */
  emoji?: string
  swatch?: string
  /** Sold only after the trip to the south. */
  south?: boolean
}

export const CLOTHES: Clothes[] = [
  { id: 'boina', name: 'Boina negra', slot: 'cabeza', price: 60, emoji: '🧢' },
  { id: 'gorro', name: 'Gorro de lana', slot: 'cabeza', price: 80, emoji: '🧶', south: true },
  { id: 'panuelo-celeste', name: 'Pañuelo celeste', slot: 'cuello', price: 40, swatch: '#7cc3ea' },
  { id: 'panuelo-amarillo', name: 'Pañuelo amarillo', slot: 'cuello', price: 40, swatch: '#f2c94c' },
  { id: 'poncho-salteno', name: 'Poncho salteño', slot: 'cuerpo', price: 100, swatch: '#b8282c' },
  { id: 'poncho-lana', name: 'Poncho de lana', slot: 'cuerpo', price: 120, swatch: '#e6d8bf', south: true },
]

export const clothesById = (id: string) => CLOTHES.find((c) => c.id === id)

/** Poses Paucho can wear clothes in (his look on Home, celebrating, and his face). */
export type WearPose = 'idle' | 'celebrate' | 'avatar'

/**
 * Overlay art that exists so far, per item and pose (drawn over the plain pose). The
 * neckerchiefs are recoloured from the red one (design/tools/build_placeholders.py);
 * the rest arrive with ChatGPT's art.
 */
export const WEAR: Record<string, Partial<Record<WearPose, string>>> = {
  'panuelo-celeste': { idle: 'wear_panuelo_celeste_idle', celebrate: 'wear_panuelo_celeste_celebrate', avatar: 'wear_panuelo_celeste_avatar' },
  'panuelo-amarillo': { idle: 'wear_panuelo_amarillo_idle', celebrate: 'wear_panuelo_amarillo_celebrate', avatar: 'wear_panuelo_amarillo_avatar' },
}
