import { useParams, useNavigate } from 'react-router-dom';
import { PopupHeader } from '../components/layout/PopupHeader';
import { mockFindings } from '../data/mockFindings';
import { Badge } from '../components/ui/Badge';
import { EvidenceBlock } from '../components/common/CommonUI';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Trash2, EyeOff, ExternalLink } from 'lucide-react';

export default function FindingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const finding = mockFindings.find(f => f.id === id);

  if (!finding) return <div>Finding not found</div>;

  return (
    <div className="flex flex-col min-h-full">
      <PopupHeader />
      
      <div className="px-4 py-6 space-y-6">
        <div className="space-y-3">
          <Badge variant={finding.severity}>{finding.severity}</Badge>
          <h2 className="text-xl font-extrabold tracking-tight leading-tight">
            {finding.title}
          </h2>
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 bg-zinc-100 p-2 rounded-lg break-all">
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            {finding.path}
          </div>
        </div>

        <div className="space-y-4">
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Context</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">{finding.explanation}</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Evidence</h3>
            <EvidenceBlock code={finding.evidence} />
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recommendation</h3>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
              <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                {finding.recommendation}
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-auto p-4 bg-white border-t border-zinc-100 flex gap-2">
        <Button variant="outline" className="flex-1 gap-2 text-zinc-500" onClick={() => navigate(-1)}>
          <EyeOff className="w-4 h-4" />
          Ignore
        </Button>
        <Button variant="danger" className="flex-1 gap-2">
          <Trash2 className="w-4 h-4" />
          Mark Resolved
        </Button>
      </div>
    </div>
  );
}
