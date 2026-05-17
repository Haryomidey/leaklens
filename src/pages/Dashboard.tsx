import {useNavigate} from 'react-router-dom';
import {ArrowRight, RefreshCw, Zap} from 'lucide-react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {RiskScoreCard, StatCard} from '../components/dashboard/DashboardMetrics';
import {FindingCard} from '../components/findings/FindingsAndScan';
import {Button} from '../components/ui/Button';
import {EmptyState} from '../components/common/CommonUI';
import {useScan} from '../popup/ScanContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const {error, isScanning, refreshScan, result} = useScan();
  const recentFindings = result.findings.slice(0, 2);

  return (
    <div className="flex min-h-full flex-col">
      <PopupHeader />

      <div className="space-y-4 px-4 py-4">
        <RiskScoreCard score={result.score} />

        <div className="grid grid-cols-3 gap-2">
          {result.stats.slice(0, 3).map(stat => (
            <StatCard
              key={stat.id}
              label={stat.label.split(' ')[0]}
              value={stat.value}
              onClick={() => navigate('/findings')}
            />
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recent Findings</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/findings')} className="h-6 px-2 text-[10px]">
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>

          {recentFindings.length > 0 ? (
            <div className="space-y-0">
              {recentFindings.map(finding => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={error ? 'Scan unavailable' : 'No findings detected'}
              description={error ?? 'The current page did not expose known client-side risk patterns.'}
              actionLabel="Run Scan"
              onAction={() => void refreshScan()}
            />
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-zinc-100 bg-white p-4">
        <Button className="flex-1 gap-2" onClick={() => { void refreshScan(); navigate('/scan'); }} disabled={isScanning}>
          {isScanning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-white" />}
          {isScanning ? 'Scanning' : 'Scan Page'}
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate('/report')}>
          Generate Report
        </Button>
      </div>
    </div>
  );
}
