export interface Stat {
  label: string;
  value: string | number;
  id: string;
}

export const mockStats: Stat[] = [
  { id: '1', label: 'Secrets Found', value: 2 },
  { id: '2', label: 'Exposed Routes', value: 1 },
  { id: '3', label: 'Source Maps', value: 1 },
  { id: '4', label: 'Public Buckets', value: 1 },
  { id: '5', label: 'Debug Endpoints', value: 0 }
];
