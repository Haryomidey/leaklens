import { useNavigate } from 'react-router-dom';
import { PopupHeader } from '../components/layout/PopupHeader';
import { RiskScoreCard, StatCard } from '../components/dashboard/DashboardMetrics';
import { mockStats } from '../data/mockStats';
import { mockFindings } from '../data/mockFindings';
import { FindingCard } from '../components/findings/FindingsAndScan';
import { Button } from '../components/ui/Button';
import { ArrowRight, Zap } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const recentFindings = mockFindings.slice(0, 2);

  return (
    <div className="flex flex-col min-h-full">
      <PopupHeader />
      
      <div className="px-4 py-4 space-y-4">
        <RiskScoreCard score={72} />
        
        <div className="grid grid-cols-3 gap-2">
          {mockStats.slice(0, 3).map(stat => (
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
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-0">
            {recentFindings.map(finding => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 bg-white border-t border-zinc-100 flex gap-2">
        <Button className="flex-1 gap-2" onClick={() => navigate('/scan')}>
          <Zap className="w-4 h-4 fill-white" />
          Scan Page
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate('/report')}>
          Generate Report
        </Button>
      </div>
    </div>
  );
}
