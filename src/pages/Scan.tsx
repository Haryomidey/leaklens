import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Check, Loader2} from 'lucide-react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {ScanStepRow} from '../components/findings/FindingsAndScan';
import {Button} from '../components/ui/Button';
import {useScan} from '../popup/ScanContext';

export default function Scan() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const {error, isScanning, refreshScan, result} = useScan();
  const isComplete = !isScanning && progress >= 100;

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

      <div className="px-4 py-5 text-center">
        <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center">
          {isComplete ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Check className="h-6 w-6" />
            </div>
          ) : (
            <>
              <Loader2 className="h-14 w-14 animate-spin text-zinc-200" strokeWidth={1} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-semibold tracking-tight">{progress}%</span>
              </div>
            </>
          )}
        </div>
        <h2 className="mb-1 text-base font-semibold">
          {isComplete ? `Checked ${result.hostname}` : `Checking ${result.hostname}`}
        </h2>
        <p className="text-xs leading-relaxed text-zinc-500">
          {error ?? (isComplete ? 'Scan complete.' : 'Looking through scripts, routes, and visible page config.')}
        </p>
      </div>

      <div className="flex-1 px-4 pb-4">
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
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
          {isScanning || progress < 100 ? 'Checking...' : 'Back to summary'}
        </Button>
      </div>
    </div>
  );
}
