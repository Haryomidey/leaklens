import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {emptyScanResult, ScanResult} from '../lib/scanTypes';

interface ScanContextValue {
  error: string | null;
  isScanning: boolean;
  result: ScanResult;
  refreshScan: () => Promise<void>;
}

const ScanContext = createContext<ScanContextValue | null>(null);

function canUseChromeTabs() {
  return typeof chrome !== 'undefined' && Boolean(chrome.tabs?.query && chrome.tabs?.sendMessage);
}

export function ScanProvider({children}: {children: ReactNode}) {
  const [result, setResult] = useState<ScanResult>(() => emptyScanResult());
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (!tab?.id) {
        throw new Error('No active tab found.');
      }

      const response = await chrome.tabs.sendMessage(tab.id, {action: 'RUN_SCAN'});

      if (!response?.result) {
        throw new Error('The page did not return scan results. Refresh the page and try again.');
      }

      setResult(response.result);
    } catch (scanError) {
      const message = scanError instanceof Error ? scanError.message : 'Unable to scan the current page.';
      setError(message);
      setResult(emptyScanResult(message));
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    void refreshScan();
  }, [refreshScan]);

  const value = useMemo(
    () => ({error, isScanning, result, refreshScan}),
    [error, isScanning, refreshScan, result],
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
