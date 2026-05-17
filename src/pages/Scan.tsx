import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Loader2} from 'lucide-react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {ScanStepRow} from '../components/findings/FindingsAndScan';
import {Button} from '../components/ui/Button';
import {useScan} from '../popup/ScanContext';

export default function Scan() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const {error, isScanning, refreshScan, result} = useScan();

  useEffect(() => {
    setProgress(0);
    void refreshScan();
  }, [refreshScan]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (isScanning ? Math.min(prev + 8, 92) : 100));
    }, 80);

    return () => clearInterval(timer);
  }, [isScanning]);

  return (
    <div className="flex min-h-full flex-col">
      <PopupHeader />

      <div className="px-4 py-6 text-center">
        <div className="relative mb-6 inline-flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-zinc-200" strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black tracking-tighter">{progress}%</span>
          </div>
        </div>
        <h2 className="mb-1 text-lg font-bold">Scanning {result.hostname}</h2>
        <p className="text-sm text-zinc-500">
          {error ?? 'Auditing client-side assets for vulnerabilities...'}
        </p>
      </div>

      <div className="flex-1 px-4 pb-4">
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
          {result.steps.map(step => (
            <ScanStepRow key={step.id} step={step} />
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-white p-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/')}
          disabled={isScanning || progress < 100}
        >
          {isScanning || progress < 100 ? 'Scanning...' : 'View Results'}
        </Button>
      </div>
    </div>
  );
}