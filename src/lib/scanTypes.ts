export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Finding {
  id: string;
  severity: FindingSeverity;
  category: string;
  title: string;
  path: string;
  explanation: string;
  confidence: number;
  evidence: string;
  recommendation: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string | number;
}

export interface ScanStep {
  id: string;
  name: string;
  status: 'pending' | 'scanning' | 'complete' | 'warning';
  description: string;
}

export interface ScanResult {
  url: string;
  hostname: string;
  scannedAt: string;
  score: number;
  findings: Finding[];
  stats: Stat[];
  steps: ScanStep[];
}

function getHostname(url = '') {
  try {
    return new URL(url).hostname || 'Current page';
  } catch {
    return 'Current page';
  }
}

export const emptyScanResult = (
  message = 'Open a web page and run a scan.',
  page: {url?: string; hostname?: string} = {},
): ScanResult => ({
  url: page.url ?? '',
  hostname: page.hostname ?? (page.url ? getHostname(page.url) : 'No active page'),
  scannedAt: new Date().toISOString(),
  score: 0,
  findings: [],
  stats: [
    {id: 'secrets', label: 'Secrets Found', value: 0},
    {id: 'routes', label: 'Exposed Routes', value: 0},
    {id: 'sourcemaps', label: 'Source Maps', value: 0},
  ],
  steps: [
    {id: 'scripts', name: 'Script Analysis', status: 'pending', description: message},
    {id: 'secrets', name: 'Secret Detection', status: 'pending', description: message},
    {id: 'routes', name: 'Route Inspection', status: 'pending', description: message},
    {id: 'storage', name: 'Storage References', status: 'pending', description: message},
  ],
});