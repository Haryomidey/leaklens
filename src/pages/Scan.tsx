import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PopupHeader } from '../components/layout/PopupHeader';
import { ScanStepRow } from '../components/findings/FindingsAndScan';
import { mockScanSteps } from '../data/mockScanSteps';
import { Button } from '../components/ui/Button';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Scan() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 100));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <PopupHeader />
      
      <div className="px-4 py-6 text-center">
        <div className="mb-6 relative inline-flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-zinc-200 animate-spin" strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black tracking-tighter">{progress}%</span>
          </div>
        </div>
        <h2 className="font-bold text-lg mb-1">Scanning example.com</h2>
        <p className="text-sm text-zinc-500">Auditing client-side assets for vulnerabilities...</p>
      </div>

      <div className="flex-1 px-4 pb-4">
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
          {mockScanSteps.map(step => (
            <ScanStepRow key={step.id} step={step} />
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-zinc-100">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate('/')}
          disabled={progress < 100}
        >
          {progress < 100 ? 'Cancel Scan' : 'View Results'}
        </Button>
      </div>
    </div>
  );
}
