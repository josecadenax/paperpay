const DISCIPLINE_COLORS: Record<string, string> = {
  Informática: 'bg-[#EEF2FF] text-[#4338CA]',
  Criptografía: 'bg-[#F5F3FF] text-[#6D28D9]',
  Biomedicina: 'bg-[#ECFDF5] text-[#065F46]',
  Física: 'bg-[#FFF7ED] text-[#9A3412]',
  Economía: 'bg-[#FFFBEB] text-[#92400E]',
  Química: 'bg-[#FDF4FF] text-[#7E22CE]',
}

export function DisciplineChip({ discipline }: { discipline: string }) {
  const color = DISCIPLINE_COLORS[discipline] ?? 'bg-[#F1F5F9] text-[#475569]'
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{discipline}</span>
  )
}
