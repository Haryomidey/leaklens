import { Shield, Settings as SettingsIcon, ChevronLeft, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import {useScan} from '../../popup/ScanContext';

export function PopupHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const {isScanning, result} = useScan();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white px-4 pb-2 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">LeakLens</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/settings')}
            className={location.pathname === '/settings' ? 'bg-zinc-100' : ''}
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {!isHome && (
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      )}

      {isHome && (
        <div className="flex items-center justify-between py-2 px-3 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest truncate max-w-[150px]">
              {result.hostname}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-600">
              {isScanning ? 'Scanning' : 'Active Monitoring'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
