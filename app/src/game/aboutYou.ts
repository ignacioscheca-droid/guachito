// "Contame un poco de vos": the onboarding questionnaire, after Finch's (minus "have
// you used Finch before?"). The answers stay on the phone; the personalized plan will
// be built from them.

/** Question id -> chosen option ids (one for single choice). */
export type AboutYou = Record<string, string[]>

export type Option = {
  id: string
  label: string
  emoji?: string
  /** Small second line, e.g. what an acronym means. */
  hint?: string
  /** "None of these": picking it clears the rest, and the other way round. */
  none?: boolean
}

export type Question = {
  id: string
  /** Index in SECTIONS. */
  section: number
  title: (you: string) => string
  subtitle?: string
  /** Several answers, with a "Siguiente" button; otherwise a tap answers and moves on. */
  multi?: boolean
  /** Plano medio pose Gauchito asks with. */
  pose: string
  options: Option[]
  skip?: (answers: AboutYou) => boolean
}

export const SECTIONS = ['Sobre vos', 'Energía y actividad', 'Cómo viene tu vida', 'En qué te ayudo']

const you = (name: string) => (name ? `, ${name}` : '')

export const QUESTIONS: Question[] = [
  {
    id: 'edad',
    section: 0,
    title: () => '¿Cuántos años tenés?',
    subtitle: 'Así puedo acompañarte mejor.',
    pose: 'b3_escucha',
    options: [
      { id: 'menos-18', label: 'Menos de 18' },
      { id: '18-24', label: '18 a 24' },
      { id: '25-34', label: '25 a 34' },
      { id: '35-44', label: '35 a 44' },
      { id: '45-54', label: '45 a 54' },
      { id: '55-64', label: '55 a 64' },
      { id: '65-mas', label: '65 o más' },
    ],
  },
  {
    id: 'sueno',
    section: 1,
    title: () => '¿Cuántas horas solés dormir por noche?',
    pose: 'b8_curioso',
    options: [
      { id: 'menos-5', emoji: '😴', label: 'Menos de 5 horas' },
      { id: '5-7', emoji: '🛏️', label: 'Entre 5 y 7 horas' },
      { id: '7-9', emoji: '🌙', label: 'Entre 7 y 9 horas' },
      { id: 'mas-9', emoji: '🌞', label: 'Más de 9 horas' },
    ],
  },
  {
    id: 'levantarse',
    section: 1,
    title: () => '¿Qué tan fácil te resulta levantarte de la cama?',
    pose: 'b3_escucha',
    options: [
      { id: 'facil', emoji: '🐬', label: 'Muy fácil, me levanto enseguida' },
      { id: 'depende', emoji: '🌱', label: 'Depende, hay días que cuesta' },
      { id: 'dificil', emoji: '🧸', label: 'Difícil, seguido me cuesta mucho' },
    ],
  },
  {
    id: 'actividad',
    section: 1,
    title: () => '¿Cuánto te movés durante el día?',
    pose: 'b8_curioso',
    options: [
      { id: 'mucho', emoji: '🏃', label: 'Estoy en movimiento casi todo el día' },
      { id: 'mezcla', emoji: '🚶', label: 'Combino ratos sin moverme con algo de movimiento' },
      { id: 'poco', emoji: '🪑', label: 'Me muevo poco y quiero moverme más' },
      { id: 'limitado', emoji: '🌻', label: 'Tengo alguna condición que limita mi movimiento' },
    ],
  },
  {
    id: 'agobio',
    section: 2,
    title: () => '¿Qué tan seguido sentís que todo te supera?',
    pose: 'b3_escucha',
    options: [
      { id: 'semanal', emoji: '😫', label: 'Varias veces por semana' },
      { id: 'mensual', emoji: '😕', label: 'Algunos días al mes' },
      { id: 'casi-nunca', emoji: '😌', label: 'Casi nunca, manejo bien el estrés' },
    ],
  },
  {
    id: 'apoyo',
    section: 2,
    title: () => '¿Con cuántas personas contás cuando las cosas se ponen difíciles?',
    pose: 'b8_curioso',
    options: [
      { id: '3-mas', emoji: '🌳', label: '3 o más' },
      { id: '2', emoji: '🌿', label: '2' },
      { id: '1', emoji: '🌱', label: '1' },
      { id: 'solo', emoji: '🍃', label: 'Por ahora, solo conmigo' },
    ],
  },
  {
    id: 'rutina',
    section: 2,
    title: () => '¿Qué tan conforme estás con tu rutina?',
    pose: 'b3_escucha',
    options: [
      { id: 'mucho', emoji: '🥳', label: 'Mucho, me cuido bien' },
      { id: 'algo', emoji: '😊', label: 'Más o menos, quiero mejorar algunas cosas' },
      { id: 'poco', emoji: '😮', label: 'Poco, quiero un cambio grande' },
    ],
  },
  {
    id: 'salud-mental',
    section: 3,
    title: () => '¿Lidiás con alguno de estos temas de salud mental?',
    subtitle: 'Elegí los que quieras. Queda solo en tu teléfono.',
    multi: true,
    pose: 'b3_escucha',
    options: [
      { id: 'ansiedad', label: 'Ansiedad' },
      { id: 'depresion', label: 'Depresión' },
      { id: 'tdah', label: 'TDAH', hint: 'Déficit de atención e hiperactividad' },
      { id: 'tept', label: 'TEPT', hint: 'Estrés postraumático' },
      { id: 'bipolar', label: 'Trastorno bipolar' },
      { id: 'toc', label: 'TOC', hint: 'Obsesivo-compulsivo' },
      { id: 'ninguno', label: 'Ninguno de estos', none: true },
      { id: 'privado', label: 'Prefiero no decirlo', none: true },
    ],
  },
  {
    id: 'areas',
    section: 3,
    title: (name) => `¿Qué te trae por acá${you(name)}?`,
    subtitle: 'Elegí todo lo que quieras.',
    multi: true,
    pose: 'b8_curioso',
    options: [
      { id: 'familia', emoji: '🏡', label: 'Pasar más tiempo con los míos' },
      { id: 'vinculos', emoji: '🤝', label: 'Conectar más con la gente' },
      { id: 'foco', emoji: '🎯', label: 'Ganar foco y productividad' },
      { id: 'rutina', emoji: '🌱', label: 'Armar y sostener una rutina' },
      { id: 'dormir', emoji: '😴', label: 'Dormir mejor' },
      { id: 'cuerpo', emoji: '💪', label: 'Moverme más y cuidar el cuerpo' },
      { id: 'estres', emoji: '🧘', label: 'Bajar el estrés' },
      { id: 'confianza', emoji: '🌻', label: 'Quererme y confiar más en mí' },
    ],
  },
  {
    id: 'postergar',
    section: 3,
    title: () => '¿Qué cosas solés postergar?',
    subtitle: 'Elegí todas las que te pasen.',
    multi: true,
    pose: 'b8_curioso',
    options: [
      { id: 'decisiones', emoji: '🛤️', label: 'Decisiones importantes' },
      { id: 'mensajes', emoji: '💬', label: 'Responder mensajes' },
      { id: 'turnos', emoji: '📅', label: 'Sacar turnos' },
      { id: 'ejercicio', emoji: '👟', label: 'Hacer ejercicio' },
      { id: 'casa', emoji: '🧹', label: 'Las tareas de la casa' },
      { id: 'nada', emoji: '✨', label: 'Casi nada, ¡soy re puntual!', none: true },
    ],
  },
  {
    id: 'por-que',
    section: 3,
    title: () => '¿Por qué creés que lo postergás?',
    subtitle: 'Elegí todas las que te pasen.',
    multi: true,
    pose: 'b3_escucha',
    options: [
      { id: 'abruma', emoji: '🏔️', label: 'Me abruma' },
      { id: 'confianza', emoji: '🌼', label: 'No confío en mí' },
      { id: 'miedo-exito', emoji: '🌟', label: 'Me da miedo que me vaya bien' },
      { id: 'motivacion', emoji: '🍂', label: 'Me falta motivación' },
      { id: 'tiempo', emoji: '⏰', label: 'No me hago el tiempo' },
    ],
    // Nothing to put off, nothing to ask about.
    skip: (a) => (a.postergar ?? []).includes('nada'),
  },
]
