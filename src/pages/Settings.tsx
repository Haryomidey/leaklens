import { useState } from 'react';
import { PopupHeader } from '../components/layout/PopupHeader';
import { ToggleRow } from '../components/common/CommonUI';
import { Button } from '../components/ui/Button';

export default function Settings() {
  const [settings, setSettings] = useState({
    autoScan: false,
    overlays: true,
    lowConfidence: false,
    sourceMaps: true,
    buckets: true,
    configs: true,
  });

  const update = (key: keyof typeof settings) => (val: boolean) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex flex-col min-h-full">
      <PopupHeader />
      
      <div className="px-4 py-4 space-y-6">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">General</h3>
          <ToggleRow 
            label="Automatic Scans" 
            description="Run a silent audit every time you visit a new domain."
            checked={settings.autoScan}
            onChange={update('autoScan')}
          />
          <ToggleRow 
            label="Visual Overlays" 
            description="Show markers directly on page elements for detected risks."
            checked={settings.overlays}
            onChange={update('overlays')}
          />
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Detection</h3>
          <ToggleRow 
            label="Source Maps" 
            description="Deep scan accessible .map files for original source leaks."
            checked={settings.sourceMaps}
            onChange={update('sourceMaps')}
          />
          <ToggleRow 
            label="Bucket Discovery" 
            description="Search for AWS, GCP, and Azure public storage references."
            checked={settings.buckets}
            onChange={update('buckets')}
          />
          <ToggleRow 
            label="Cloud Configs" 
            description="Detect Firebase, Supabase, and custom config objects."
            checked={settings.configs}
            onChange={update('configs')}
          />
          <ToggleRow 
            label="Low Confidence" 
            description="Include heuristic matches that may require manual verification."
            checked={settings.lowConfidence}
            onChange={update('lowConfidence')}
          />
        </section>

        <section className="pb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Account</h3>
          <div className="bg-zinc-100 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Standard Account</p>
              <p className="text-[11px] text-zinc-500">Free Tier (3 domains / day)</p>
            </div>
            <Button size="sm" variant="primary" className="h-8">Upgrade</Button>
          </div>
        </section>
      </div>
    </div>
  );
}