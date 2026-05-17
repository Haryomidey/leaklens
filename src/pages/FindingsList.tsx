import { PopupHeader } from '../components/layout/PopupHeader';
import { mockFindings } from '../data/mockFindings';
import { FindingCard } from '../components/findings/FindingsAndScan';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Map, ListFilter } from 'lucide-react';

export default function FindingsList() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full">
      <PopupHeader />
      
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Reported Issues</h2>
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg">
            <ListFilter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl">
          <Button variant="ghost" size="sm" className="flex-1 bg-white shadow-sm text-zinc-900">All Layers</Button>
          <Button variant="ghost" size="sm" className="flex-1 text-zinc-500" onClick={() => navigate('/heatmap')}>
            <Map className="w-3.5 h-3.5 mr-1.5" />
            Heatmap
          </Button>
        </div>

        <div className="pb-4">
          {mockFindings.map(finding => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      </div>
    </div>
  );
}
