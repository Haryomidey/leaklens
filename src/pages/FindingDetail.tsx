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
  const {dismissFinding, result} = useScan();
  const finding = result.findings.find(item => item.id === id);
  const closeFinding = () => {
    if (id) {
      dismissFinding(id);
    }

    navigate('/findings');
  };

  if (!finding) {
    return (
      <div className="flex min-h-full flex-col">
        <PopupHeader />
        <EmptyState
          title="Issue not found"
          description="It is not part of the latest scan for this tab."
          actionLabel="Scan again"
          onAction={() => navigate('/scan')}
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
          <h2 className="text-xl font-semibold leading-tight">
            {finding.title}
          </h2>
          <div className="flex items-center gap-2 break-all rounded-lg bg-zinc-100 p-2 font-mono text-[11px] text-zinc-500">
            <ExternalLink className="h-3 w-3 shrink-0" />
            {finding.path}
          </div>
        </div>

        <div className="space-y-4">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900">What happened</h3>
            <p className="text-sm leading-relaxed text-zinc-600">{finding.explanation}</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900">Evidence</h3>
            <EvidenceBlock code={finding.evidence} />
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900">Suggested fix</h3>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm leading-relaxed text-zinc-600">
                {finding.recommendation}
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-zinc-100 bg-white p-4">
        <Button variant="outline" className="flex-1 gap-2 text-zinc-500" onClick={closeFinding}>
          <EyeOff className="h-4 w-4" />
          Ignore
        </Button>
        <Button variant="danger" className="flex-1 gap-2" onClick={closeFinding}>
          <Trash2 className="h-4 w-4" />
          Mark done
        </Button>
      </div>
    </div>
  );
}
