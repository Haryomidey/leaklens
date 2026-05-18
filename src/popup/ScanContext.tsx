import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {emptyScanResult, ScanResult} from '../lib/scanTypes';
import {defaultSettings, mergeSettings, SettingsState} from '../lib/settings';

interface ScanContextValue {
  dismissFinding: (id: string) => void;
  error: string | null;
  isScanning: boolean;
  result: ScanResult;
  refreshScan: () => Promise<void>;
}

const ScanContext = createContext<ScanContextValue | null>(null);

function canUseChromeTabs() {
  return typeof chrome !== 'undefined' && Boolean(chrome.tabs?.query && chrome.tabs?.sendMessage);
}

function canInjectScanner() {
  return typeof chrome !== 'undefined' && Boolean(chrome.scripting?.executeScript);
}

function isInjectableUrl(url = '') {
  return /^(https?:|file:)/i.test(url);
}

function getPageFromTab(tab: {title?: string; url?: string}) {
  if (!tab.url) {
    return {hostname: tab.title || 'Current page', url: ''};
  }

  try {
    const url = new URL(tab.url);
    return {
      hostname: url.hostname || tab.title || 'Current page',
      url: tab.url,
    };
  } catch {
    return {hostname: tab.title || 'Current page', url: tab.url};
  }
}

function isMissingReceiver(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Receiving end does not exist') || message.includes('Could not establish connection');
}

function waitForContentScript() {
  return new Promise(resolve => {
    window.setTimeout(resolve, 80);
  });
}

async function loadSettings() {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return defaultSettings;
  }

  const stored = await chrome.storage.local.get<{leaklensSettings?: Partial<SettingsState>}>('leaklensSettings');
  return mergeSettings(stored.leaklensSettings);
}

async function requestScan(tabId: number, settings: SettingsState) {
  const response = await chrome.tabs.sendMessage(tabId, {action: 'RUN_SCAN', settings});

  if (!response?.result) {
    throw new Error('The page did not return scan results. Refresh the page and try again.');
  }

  return response.result as ScanResult;
}

export function ScanProvider({children}: {children: ReactNode}) {
  const [result, setResult] = useState<ScanResult>(() => emptyScanResult());
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dismissFinding = useCallback((id: string) => {
    setResult(current => {
      const findings = current.findings.filter(finding => finding.id !== id);
      const severityWeight = {critical: 35, high: 24, medium: 14, low: 7};

      return {
        ...current,
        findings,
        score: Math.min(100, findings.reduce((score, finding) => score + severityWeight[finding.severity], 0)),
        stats: current.stats.map(stat => {
        if (stat.id === 'secrets') {
          return {...stat, value: findings.filter(finding => finding.category === 'Secrets').length};
        }

        if (stat.id === 'routes') {
          return {...stat, value: findings.filter(finding => finding.category === 'Routes').length};
        }

        if (stat.id === 'sourcemaps') {
          return {...stat, value: findings.filter(finding => finding.category === 'Source Maps').length};
        }

        return stat;
        }),
      };
    });
  }, []);

  const refreshScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    if (!canUseChromeTabs()) {
      setResult(emptyScanResult('Chrome extension APIs are only available after loading the built extension.'));
      setError('Load the dist folder as an unpacked Chrome extension to scan the active tab.');
      setIsScanning(false);
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      const settings = await loadSettings();

      if (!tab?.id) {
        throw new Error('No active tab found.');
      }

      const page = getPageFromTab(tab);
      setResult(emptyScanResult('Checking this page...', page));

      if (!isInjectableUrl(tab.url)) {
        throw new Error('LeakLens can scan regular website tabs. Open an http, https, or local file page and try again.');
      }

      try {
        setResult(await requestScan(tab.id, settings));
      } catch (scanError) {
        if (!isMissingReceiver(scanError) || !canInjectScanner()) {
          throw scanError;
        }

        await chrome.scripting.executeScript({
          target: {tabId: tab.id},
          files: ['content.js'],
        });
        await waitForContentScript();
        setResult(await requestScan(tab.id, settings));
      }
    } catch (scanError) {
      const message = scanError instanceof Error ? scanError.message : 'Unable to scan the current page.';
      setError(message);
      setResult(current => emptyScanResult(message, {hostname: current.hostname, url: current.url}));
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings().then(settings => {
      if (settings.autoScan) {
        void refreshScan();
      }
    });
  }, [refreshScan]);

  const value = useMemo(
    () => ({dismissFinding, error, isScanning, result, refreshScan}),
    [dismissFinding, error, isScanning, refreshScan, result],
  );

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);

  if (!context) {
    throw new Error('useScan must be used within ScanProvider');
  }

  return context;
}
