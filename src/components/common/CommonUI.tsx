import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export function EmptyState({ title, description, onAction, actionLabel }: { 
  title: string; 
  description: string; 
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
        <ShieldCheck className="w-8 h-8 text-emerald-500" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-6">{description}</p>
      {onAction && actionLabel && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

export function ToggleRow({ label, description, checked, onChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-zinc-100 last:border-0">
      <div className="flex-1 pr-4">
        <h4 className="font-bold text-sm leading-none mb-1.5">{label}</h4>
        {description && <p className="text-[11px] text-zinc-500 leading-tight">{description}</p>}
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${checked ? 'bg-zinc-900' : 'bg-zinc-200'}`}
      >
        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute transition-all ${checked ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export function EvidenceBlock({ code }: { code: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 font-mono text-[11px] overflow-hidden relative group">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
          onClick={() => navigator.clipboard.writeText(code)}
        >
          Copy
        </Button>
      </div>
      <pre className="text-zinc-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
