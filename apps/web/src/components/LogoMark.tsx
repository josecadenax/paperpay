// Símbolo de PaperPay: una "P" formada por líneas paralelas, como renglones de un artículo.
// Archivos exportables en public/brand/.
const PATHS = [
  'M3 22 V1.8 H12.4 A7.8 7.8 0 0 1 12.4 17.4 H3',
  'M6.2 22 V5 H12.4 A4.6 4.6 0 0 1 12.4 14.2 H6.2',
  'M9.4 22 V8.2 H12.4 A1.4 1.4 0 0 1 12.4 11 H9.4',
]

const PALETTES = {
  color: ['#0F172A', '#10B981', '#2F5BFF'],
  inverse: ['#FFFFFF', '#10B981', '#5B7FFF'],
  mono: ['currentColor', 'currentColor', 'currentColor'],
} as const

interface Props {
  size?: number
  variant?: keyof typeof PALETTES
  className?: string
}

export function LogoMark({ size = 28, variant = 'color', className }: Props) {
  const colors = PALETTES[variant]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <g transform="translate(0.4 0.6)" fill="none" strokeWidth="2" strokeLinejoin="round">
        {PATHS.map((d, i) => (
          <path key={d} d={d} stroke={colors[i]} />
        ))}
      </g>
    </svg>
  )
}
