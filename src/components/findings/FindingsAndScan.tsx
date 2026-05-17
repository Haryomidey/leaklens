import {useNavigate} from 'react-router-dom';
import {AlertCircle, Check, ChevronRight} from 'lucide-react';
import {Finding, ScanStep} from '../../lib/scanTypes';
import {Badge} from '../ui/Badge';
import {Card} from '../ui/Card';

export function FindingCard({finding}: {finding: Finding}) {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative mb-2 cursor-pointer p-4 hover:border-zinc-300 hover:bg-zinc-50/60"
      onClick={() => navigate(`/findings/${finding.id}`)}
    >
      <div className="mb-2 flex items-start justify-between">
        <Badge variant={finding.severity}>{finding.severity}</Badge>
        <div className="rounded-md p-1 text-zinc-400 transition-colors group-hover:text-zinc-700">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      <h3 className="mb-1 line-clamp-1 text-sm font-semibold">{finding.title}</h3>
      <p className="mb-3 truncate font-mono text-[11px] text-zinc-500">{finding.path}</p>

      <div className="mt-auto flex items-center gap-2 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-zinc-400" />
          {finding.category}
        </div>
        <div>{finding.confidence}% match</div>
      </div>
    </Card>
  );
}

export function ScanStepRow({step}: {step: ScanStep}) {
  const icons = {
    pending: <div className="h-2 w-2 rounded-full bg-zinc-200" />,
    scanning: <AlertCircle className="h-4 w-4 animate-spin text-blue-500" />,
    complete: (
      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
        <Check className="h-3.5 w-3.5" />
      </div>
    ),
    warning: (
      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-100 text-[11px] font-semibold text-orange-700">
        !
      </div>
    ),
  };

  return (
    <div className="flex items-start gap-3 border-b border-zinc-100 p-3 last:border-0">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        {icons[step.status]}
      </div>
      <div className="flex-1">
        <div className="mb-0.5 flex items-center justify-between">
          <span className="text-sm font-semibold">{step.name}</span>
          <span className="text-[11px] font-medium capitalize text-zinc-400">{step.status}</span>
        </div>
        <p className="text-xs leading-snug text-zinc-500">{step.description}</p>
      </div>
    </div>
  );
}
