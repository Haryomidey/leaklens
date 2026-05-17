import {Finding, ScanStep} from '../../lib/scanTypes';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FindingCard({ finding }: { finding: Finding }) {
  const navigate = useNavigate();

  return (
    <Card 
      className="p-4 cursor-pointer hover:border-zinc-400 group relative mb-3"
      onClick={() => navigate(`/findings/${finding.id}`)}
    >
      <div className="flex items-start justify-between mb-2">
        <Badge variant={finding.severity}>{finding.severity}</Badge>
        <div className="p-1 bg-zinc-50 rounded-lg group-hover:bg-zinc-100 transition-colors">
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
        </div>
      </div>
      
      <h3 className="font-bold text-sm mb-1 line-clamp-1">{finding.title}</h3>
      <p className="text-[11px] text-zinc-500 font-mono truncate mb-2">{finding.path}</p>
      
      <div className="flex items-center gap-1.5 mt-auto">
        <div className="flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-600">
          <span className="w-1 h-1 rounded-full bg-zinc-400" />
          {finding.category}
        </div>
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          {finding.confidence}% Confidence
        </div>
      </div>
    </Card>
  );
}

export function ScanStepRow({ step }: { step: ScanStep }) {
  const icons = {
    pending: <div className="w-2 h-2 rounded-full bg-zinc-200" />,
    scanning: <AlertCircle className="w-5 h-5 text-blue-500 animate-spin" />,
    complete: <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-[10px]">✓</div>,
    warning: <div className="w-5 h-5 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-[10px]">!</div>,
  };

  return (
    <div className="flex items-start gap-3 p-3 border-b border-zinc-100 last:border-0">
      <div className="mt-1 flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {icons[step.status as keyof typeof icons]}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-bold text-sm">{step.name}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{step.status}</span>
        </div>
        <p className="text-[11px] text-zinc-500">{step.description}</p>
      </div>
    </div>
  );
}
