// Kształt koduje semantykę stanu — nie tylko kolor.
// live:     ●  żywy, bursztyn (jedyny token warn w UI — nie mylić z text-price)
// pending:  ◌  oczekujący, text-ink-2
// done-ok:  ✓  zakończony pomyślnie, ok
// done-err: ✗  zakończony bez skutku, err
// draft:    ○  szkic / nieaktywny, text-ink-3
export type StatusShape = 'live' | 'pending' | 'done-ok' | 'done-err' | 'draft'

const CHAR: Record<StatusShape, string> = {
  live:     '●',
  pending:  '◌',
  'done-ok':  '✓',
  'done-err': '✗',
  draft:    '○',
}

const COLOR: Record<StatusShape, string> = {
  live:     'text-warn',   // bursztyn — jedyny status z tym kolorem
  pending:  'text-ink-2',
  'done-ok':  'text-ok',
  'done-err': 'text-err',
  draft:    'text-ink-3',
}

type StatusDotProps = {
  shape: StatusShape
  label: string
}

export function StatusDot({ shape, label }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={label}>
      <span
        className={`shrink-0 text-xs leading-none ${COLOR[shape]}`}
        aria-hidden="true"
      >
        {CHAR[shape]}
      </span>
      <span className="text-sm text-ink-2">{label}</span>
    </span>
  )
}
