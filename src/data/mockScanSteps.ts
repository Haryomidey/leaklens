export interface ScanStep {
  id: string;
  name: string;
  status: 'pending' | 'scanning' | 'complete' | 'warning';
  description: string;
}

export const mockScanSteps: ScanStep[] = [
  {
    id: '1',
    name: 'Script Analysis',
    status: 'complete',
    description: 'Scanning 12 JavaScript bundles for secrets.'
  },
  {
    id: '2',
    name: 'Source Maps',
    status: 'warning',
    description: '1 source map found and analyzed.'
  },
  {
    id: '3',
    name: 'API Key Detection',
    status: 'scanning',
    description: 'Matching patterns for 50+ providers.'
  },
  {
    id: '4',
    name: 'Public Configs',
    status: 'pending',
    description: 'Checking for Firebase, Supabase, and AWS configs.'
  },
  {
    id: '5',
    name: 'Storage Scanning',
    status: 'pending',
    description: 'Detecting S3, GCS, and Azure bucket URLs.'
  },
  {
    id: '6',
    name: 'Route Inspection',
    status: 'pending',
    description: 'Analyzing client-side routing manifest.'
  }
];
