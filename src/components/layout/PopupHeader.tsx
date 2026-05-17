import {ChevronLeft, ScanSearch, Settings as SettingsIcon} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';

export function PopupHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white px-4 pb-3 pt-4">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
          onClick={() => navigate('/')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white">
            <ScanSearch className="h-4 w-4 text-zinc-900" />
          </div>
          <span className="text-lg font-semibold">LeakLens</span>
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
        <div className="mt-3 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      )}
    </header>
  );
}
