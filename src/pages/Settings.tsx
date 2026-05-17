import {useEffect, useState} from 'react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {ToggleRow} from '../components/common/CommonUI';
import {Button} from '../components/ui/Button';
import {useScan} from '../popup/ScanContext';

const defaultSettings = {
  autoScan: false,
  overlays: true,
  lowConfidence: false,
  sourceMaps: true,
  buckets: true,
  configs: true,
};

type SettingsState = typeof defaultSettings;

function canUseStorage() {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [status, setStatus] = useState('Saved');
  const {refreshScan} = useScan();

  useEffect(() => {
    if (!canUseStorage()) return;

    void chrome.storage.local.get<{leaklensSettings?: SettingsState}>('leaklensSettings').then(stored => {
      if (stored.leaklensSettings) {
        setSettings({...defaultSettings, ...stored.leaklensSettings});
      }
    });
  }, []);

  const persist = (next: SettingsState) => {
    setSettings(next);
    setStatus('Saving...');

    if (!canUseStorage()) {
      setStatus('Saved here');
      return;
    }

    void chrome.storage.local.set({leaklensSettings: next}).then(() => {
      setStatus('Saved');
    });
  };

  const update = (key: keyof SettingsState) => (val: boolean) => {
    persist({...settings, [key]: val});
  };

  return (
    <div className="flex min-h-full flex-col">
      <PopupHeader />

      <div className="space-y-6 px-4 py-4">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">General</h3>
            <span className="text-xs font-medium text-emerald-700">{status}</span>
          </div>
          <ToggleRow
            label="Scan on open"
            description="Refresh findings when you open the popup."
            checked={settings.autoScan}
            onChange={update('autoScan')}
          />
          <ToggleRow
            label="Page preview"
            description="Show findings in the preview screen."
            checked={settings.overlays}
            onChange={update('overlays')}
          />
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-zinc-900">Checks</h3>
          <ToggleRow
            label="Source Maps"
            description="Look for source-map references."
            checked={settings.sourceMaps}
            onChange={update('sourceMaps')}
          />
          <ToggleRow
            label="Bucket Discovery"
            description="Look for public cloud storage links."
            checked={settings.buckets}
            onChange={update('buckets')}
          />
          <ToggleRow
            label="Cloud Configs"
            description="Look for common public config markers."
            checked={settings.configs}
            onChange={update('configs')}
          />
          <ToggleRow
            label="Low Confidence"
            description="Include weaker matches."
            checked={settings.lowConfidence}
            onChange={update('lowConfidence')}
          />
        </section>

        <section className="pb-8">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900">Actions</h3>
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold">Run a fresh scan</p>
              <p className="text-xs text-zinc-500">Use these settings on the active tab.</p>
            </div>
            <Button size="sm" variant="primary" className="h-8" onClick={() => void refreshScan()}>
              Scan
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
