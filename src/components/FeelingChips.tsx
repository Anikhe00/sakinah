import { FEELINGS, type FeelingId } from '../lib/feelings'

interface Props {
  value: FeelingId | null
  onChange: (id: FeelingId) => void
}

export function FeelingChips({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="sr-only">Choose a feeling</legend>
      <div className="flex flex-wrap gap-2">
        {FEELINGS.map((f) => {
          const checked = value === f.id
          return (
            <label
              key={f.id}
              className={[
                'chip relative inline-flex min-h-11 cursor-pointer select-none items-center rounded-full border px-4 text-[15px] transition-colors',
                checked
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-line bg-surface text-ink hover:border-accent',
              ].join(' ')}
            >
              <input
                type="radio"
                name="feeling"
                value={f.id}
                checked={checked}
                onChange={() => onChange(f.id)}
                className="sr-only"
              />
              {f.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
