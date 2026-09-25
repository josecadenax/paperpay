// Portada visual por disciplina: degradado + patrón geométrico en SVG.
// Sin imágenes externas ni derechos; consistente en todo el catálogo.

const THEMES: Record<string, { from: string; to: string; ink: string }> = {
  Informática: { from: '#2F5BFF', to: '#6366F1', ink: '#EAEFFF' },
  Criptografía: { from: '#6D28D9', to: '#9333EA', ink: '#F3E8FF' },
  Biomedicina: { from: '#0E9F6E', to: '#10B981', ink: '#E7FBF3' },
  Física: { from: '#0EA5E9', to: '#2563EB', ink: '#E6F4FF' },
  Química: { from: '#DB2777', to: '#9D174D', ink: '#FDE7F1' },
  Matemáticas: { from: '#B45309', to: '#D97706', ink: '#FEF3E2' },
  Astronomía: { from: '#1E293B', to: '#4338CA', ink: '#E4E7FF' },
  Economía: { from: '#047857', to: '#0D9488', ink: '#E6FBF6' },
  'Ciencias Ambientales': { from: '#15803D', to: '#65A30D', ink: '#EDFBE0' },
}

const FALLBACK = { from: '#475569', to: '#1E293B', ink: '#E2E8F0' }

interface Props {
  discipline?: string
  className?: string
}

export function DisciplineCover({ discipline, className }: Props) {
  const theme = (discipline && THEMES[discipline]) || FALLBACK
  const gid = `g-${(discipline ?? 'x').replace(/[^a-zA-Z]/g, '')}`

  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.from} />
            <stop offset="100%" stopColor={theme.to} />
          </linearGradient>
        </defs>
        <rect width="400" height="160" fill={`url(#${gid})`} />
        <circle cx="330" cy="30" r="70" fill="#FFFFFF" opacity="0.08" />
        <circle cx="360" cy="150" r="50" fill="#FFFFFF" opacity="0.06" />
        <g stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1.5" fill="none">
          <path d="M24 120 h120 M24 132 h90 M24 108 h70" />
        </g>
        {discipline && (
          <text x="24" y="44" fill={theme.ink} fontSize="15" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="0.5">
            {discipline.toUpperCase()}
          </text>
        )}
      </svg>
    </div>
  )
}
