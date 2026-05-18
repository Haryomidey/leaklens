import {AlertTriangle, MapPin} from 'lucide-react';
import {motion} from 'motion/react';
import {useEffect, useState} from 'react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {Badge} from '../components/ui/Badge';
import {EmptyState} from '../components/common/CommonUI';
import {defaultSettings, mergeSettings} from '../lib/settings';
import {useScan} from '../popup/ScanContext';

export default function HeatmapPreview() {
  const {result} = useScan();
  const [showPreview, setShowPreview] = useState(defaultSettings.overlays);
  const visibleFindings = result.findings.slice(0, 4);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return;

    void chrome.storage.local.get<{leaklensSettings?: Partial<typeof defaultSettings>}>('leaklensSettings').then(stored => {
      setShowPreview(mergeSettings(stored.leaklensSettings).overlays);
    });
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <PopupHeader />

      <div className="flex flex-1 flex-col">
        <div className="px-4 pb-2 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Page preview</h2>
            <Badge variant="neutral">Live</Badge>
          </div>
        </div>

        <div className="relative mx-4 min-h-[260px] flex-1 overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="flex h-7 items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-3">
            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
            <span className="truncate text-[11px] font-medium text-zinc-500">{result.url || result.hostname}</span>
          </div>

          <div className="space-y-3 p-4">
            {!showPreview ? (
              <EmptyState
                title="Preview is off"
                description="Turn on Page preview in settings to show issue markers here."
              />
            ) : visibleFindings.length > 0 ? (
              visibleFindings.map((finding, index) => (
                <motion.div
                  key={finding.id}
                  initial={{opacity: 0, scale: 0.96}}
                  animate={{opacity: 1, scale: 1}}
                  transition={{delay: index * 0.08}}
                  className="relative rounded-lg border border-orange-200 bg-orange-50/50 p-3"
                >
                  <div className="absolute -right-2 -top-2 rounded-full bg-orange-500 p-1 text-white shadow-lg">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <Badge variant={finding.severity}>{finding.severity}</Badge>
                  <p className="mt-2 truncate text-sm font-semibold">{finding.title}</p>
                  <p className="truncate font-mono text-[10px] text-zinc-500">{finding.path}</p>
                </motion.div>
              ))
            ) : (
              <div className="flex h-48 items-center justify-center text-center text-sm font-medium text-zinc-500">
                No preview items for the latest scan.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-100 bg-white p-4">
          <p className="mb-2 text-[11px] leading-tight text-zinc-500">
            Preview items are based on the evidence found in the active tab.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-semibold text-zinc-600">Critical</span>
            <span className="ml-2 h-2 w-2 rounded-full bg-orange-400" />
            <span className="text-[10px] font-semibold text-zinc-600">Risk area</span>
          </div>
        </div>
      </div>
    </div>
  );
}
