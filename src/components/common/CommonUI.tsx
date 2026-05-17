import {SearchCheck} from 'lucide-react';
import {Button} from '../ui/Button';

export function EmptyState({title, description, onAction, actionLabel}: {
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100">
        <SearchCheck className="h-6 w-6 text-zinc-600" />
      </div>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <p className="mb-6 text-sm leading-relaxed text-zinc-500">{description}</p>
      {onAction && actionLabel && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

export function ToggleRow({label, description, checked, onChange}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between border-b border-zinc-100 py-4 last:border-0">
      <div className="flex-1 pr-4">
        <h4 className="mb-1.5 text-sm font-semibold leading-none">{label}</h4>
        {description && <p className="text-xs leading-snug text-zinc-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${checked ? 'bg-zinc-900' : 'bg-zinc-200'}`}
      >
        <div className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all ${checked ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export function EvidenceBlock({code}: {code: string}) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-zinc-950 p-4 font-mono text-[11px]">
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="outline"
          size="sm"
          className="h-7 bg-zinc-800 text-[10px] text-zinc-200 hover:text-white"
          onClick={() => navigator.clipboard.writeText(code)}
        >
          Copy
        </Button>
      </div>
      <pre className="overflow-x-auto text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}
