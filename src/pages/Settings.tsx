import {useEffect, useState} from 'react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {ToggleRow} from '../components/common/CommonUI';
import {Button} from '../components/ui/Button';
import {useScan} from '../popup/ScanContext';
import {defaultSettings, mergeSettings, SettingsState} from '../lib/settings';

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
        setSettings(mergeSettings(stored.leaklensSettings));
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
  const updateValue = <Key extends keyof SettingsState>(key: Key, value: SettingsState[Key]) => {
    persist({...settings, [key]: value});
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
          <h3 className="mb-2 text-sm font-semibold text-zinc-900">Scan mode</h3>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-white p-2">
            <Button
              size="sm"
              variant={settings.severityMode === 'serious' ? 'primary' : 'ghost'}
              onClick={() => updateValue('severityMode', 'serious')}
            >
              Serious only
            </Button>
            <Button
              size="sm"
              variant={settings.severityMode === 'audit' ? 'primary' : 'ghost'}
              onClick={() => updateValue('severityMode', 'audit')}
            >
              Audit mode
            </Button>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-zinc-900">Auth profile</h3>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-white p-2">
            <Button
              size="sm"
              variant={settings.authProfile === 'currentSession' ? 'primary' : 'ghost'}
              onClick={() => updateValue('authProfile', 'currentSession')}
            >
              Current session
            </Button>
            <Button
              size="sm"
              variant={settings.authProfile === 'anonymous' ? 'primary' : 'ghost'}
              onClick={() => updateValue('authProfile', 'anonymous')}
            >
              Anonymous
            </Button>
          </div>
          <p className="mt-2 text-xs leading-snug text-zinc-500">
            Current session uses the active browser cookies for verification requests.
          </p>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-zinc-900">Checks</h3>
          <ToggleRow
            label="Active endpoint verification"
            description="Probe discovered same-origin endpoints for reachable sensitive paths."
            checked={settings.activeVerification}
            onChange={update('activeVerification')}
          />
          <ToggleRow
            label="JS bundle parsing"
            description="Extract endpoints and indicators from downloaded same-origin bundles."
            checked={settings.bundleAnalysis}
            onChange={update('bundleAnalysis')}
          />
          <ToggleRow
            label="Dependency CVEs"
            description="Fingerprint frontend libraries and match known vulnerable versions."
            checked={settings.dependencyCves}
            onChange={update('dependencyCves')}
          />
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
