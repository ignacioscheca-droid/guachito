// Runs before every test file: the store reads localStorage as soon as it loads.
const data = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size
    },
  },
})

// The game works in the device's local day: the tests pin it (see "test" in package.json).
const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
if (zone !== 'Europe/Madrid') throw new Error(`Tests need TZ=Europe/Madrid (got ${zone}): run them with npm test`)
