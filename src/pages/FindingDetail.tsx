import {useNavigate, useParams} from 'react-router-dom';
import {ExternalLink, EyeOff, Trash2} from 'lucide-react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {Badge} from '../components/ui/Badge';
import {EmptyState, EvidenceBlock} from '../components/common/CommonUI';
import {Button} from '../components/ui/Button';
import {useScan} from '../popup/ScanContext';

export default function FindingDetail() {
  const {id} = useParams();
  const navigate = useNavigate();
  const {refreshScan, result} = useScan();
  const finding = result.findings.find(item => item.id === id);

  if (!finding) {
    return (
      <div className="flex min-h-full flex-col">
        <PopupHeader />
        <EmptyState
          title="Finding not found"
          description="This finding is not available in the latest active-tab scan."
          actionLabel="Run Scan"
          onAction={() => void refreshScan()}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <PopupHeader />

      <div className="space-y-6 px-4 py-6">
        <div className="space-y-3">
          <Badge variant={finding.severity}>{finding.severity}</Badge>
          <h2 className="text-xl font-extrabold leading-tight tracking-tight">
            {finding.title}
          </h2>
          <div className="flex items-center gap-2 break-all rounded-lg bg-zinc-100 p-2 font-mono text-[11px] text-zinc-500">
            <ExternalLink className="h-3 w-3 shrink-0" />
            {finding.path}
          </div>
        </div>

        <div className="space-y-4">
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Context</h3>
            <p className="text-sm leading-relaxed text-zinc-600">{finding.explanation}</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Evidence</h3>
            <EvidenceBlock code={finding.evidence} />
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recommendation</h3>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-medium leading-relaxed text-emerald-800">
                {finding.recommendation}
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-zinc-100 bg-white p-4">
        <Button variant="outline" className="flex-1 gap-2 text-zinc-500" onClick={() => navigate(-1)}>
          <EyeOff className="h-4 w-4" />
          Ignore
        </Button>
        <Button variant="danger" className="flex-1 gap-2">
          <Trash2 className="h-4 w-4" />
          Mark Resolved
        </Button>
      </div>
    </div>
  );
}