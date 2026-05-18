import {useNavigate} from 'react-router-dom';
import {ListFilter, Map} from 'lucide-react';
import {useMemo, useState} from 'react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {FindingCard} from '../components/findings/FindingsAndScan';
import {Button} from '../components/ui/Button';
import {EmptyState} from '../components/common/CommonUI';
import {useScan} from '../popup/ScanContext';

export default function FindingsList() {
  const navigate = useNavigate();
  const {result} = useScan();
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const filteredFindings = useMemo(
    () => severityFilter === 'all'
      ? result.findings
      : result.findings.filter(finding => finding.severity === severityFilter),
    [result.findings, severityFilter],
  );
  const filters = ['all', 'critical', 'high', 'medium', 'low'] as const;
  const cycleFilter = () => {
    const currentIndex = filters.indexOf(severityFilter);
    setSeverityFilter(filters[(currentIndex + 1) % filters.length]);
  };

  return (
    <div className="flex min-h-full flex-col">
      <PopupHeader />

      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Issues</h2>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            title={`Filter: ${severityFilter}`}
            onClick={cycleFilter}
          >
            <ListFilter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-zinc-100 p-1">
          <Button variant="ghost" size="sm" className="flex-1 bg-white text-zinc-900 shadow-sm">
            {severityFilter === 'all' ? 'All issues' : severityFilter}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-zinc-500" onClick={() => navigate('/heatmap')}>
            <Map className="mr-1.5 h-3.5 w-3.5" />
            Heatmap
          </Button>
        </div>

        <div className="pb-4">
          {filteredFindings.length > 0 ? (
            filteredFindings.map(finding => (
              <FindingCard key={finding.id} finding={finding} />
            ))
          ) : (
            <EmptyState
              title="Nothing here"
              description={result.findings.length ? 'No issues match this filter.' : 'Scan the current tab to fill this list.'}
              actionLabel="Scan now"
              onAction={() => navigate('/scan')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
