interface Props {
  amount?: string
  size?: 'sm' | 'md'
}

export function UsdcChip({ amount = '0.50 USDC', size = 'md' }: Props) {
  const small = size === 'sm'

  return (
    <span
      className={`inline-flex items-center rounded-full bg-usdc-bg font-semibold text-usdc ${
        small ? 'gap-1 px-2 py-0.5 text-xs' : 'gap-1.5 px-2.5 py-1 text-sm'
      }`}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full bg-usdc font-bold leading-none text-white ${
          small ? 'h-3.5 w-3.5 text-[8px]' : 'h-[18px] w-[18px] text-[10px]'
        }`}
        aria-hidden
      >
        $
      </span>
      {amount}
    </span>
  )
}
