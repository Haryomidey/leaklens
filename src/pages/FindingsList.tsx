import {useNavigate} from 'react-router-dom';
import {ListFilter, Map} from 'lucide-react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {FindingCard} from '../components/findings/FindingsAndScan';
import {Button} from '../components/ui/Button';
import {EmptyState} from '../components/common/CommonUI';
import {useScan} from '../popup/ScanContext';

export default function FindingsList() {
  const navigate = useNavigate();
  const {refreshScan, result} = useScan();

  return (
    <div className="flex min-h-full flex-col">
      <PopupHeader />

      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Reported Issues</h2>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
            <ListFilter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-zinc-100 p-1">
          <Button variant="ghost" size="sm" className="flex-1 bg-white text-zinc-900 shadow-sm">All Layers</Button>
          <Button variant="ghost" size="sm" className="flex-1 text-zinc-500" onClick={() => navigate('/heatmap')}>
            <Map className="mr-1.5 h-3.5 w-3.5" />
            Heatmap
          </Button>
        </div>

        <div className="pb-4">
          {result.findings.length > 0 ? (
            result.findings.map(finding => (
              <FindingCard key={finding.id} finding={finding} />
            ))
          ) : (
            <EmptyState
              title="No findings"
              description="Run a scan on the active tab to populate this list."
              actionLabel="Run Scan"
              onAction={() => void refreshScan()}
            />
          )}
        </div>
      </div>
    </div>
  );
}