export interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  path: string;
  explanation: string;
  confidence: number;
  evidence: string;
  recommendation: string;
}

export const mockFindings: Finding[] = [
  {
    id: '1',
    severity: 'critical',
    category: 'Secrets',
    title: 'Google Maps API Key Exposed',
    path: '/assets/index-D7b2a.js:142',
    explanation: 'A Google Maps API key was found in a client-side bundle. Attackers can use this key to make requests on your behalf, potentially leading to high costs.',
    confidence: 100,
    evidence: 'const apiKey = "AIzaSyAsX9J-k6J...";',
    recommendation: 'Restrict this key by HTTP referrer in the Google Cloud Console and rotate it if it has been used in production.'
  },
  {
    id: '2',
    severity: 'high',
    category: 'Config',
    title: 'Public Firebase Config Detected',
    path: '/index.html:42',
    explanation: 'Full Firebase configuration object is visible in the HTML source. While some fields are meant to be public, exposing them unnecessarily increases attack surface.',
    confidence: 95,
    evidence: 'firebase.initializeApp({ apiKey: "...", authDomain: "..." });',
    recommendation: 'Ensure Firestore/Storage rules are strictly configured. Consider moving sensitivity initialization to build-time environment variables.'
  },
  {
    id: '3',
    severity: 'high',
    category: 'Assets',
    title: 'Source Map Publicly Accessible',
    path: '/assets/index.js.map',
    explanation: 'Original source code can be reconstructed from this map file, exposing internal logic and potentially commented secrets.',
    confidence: 100,
    evidence: '{"version":3,"file":"index.js","sources":["src/main.ts"...]}',
    recommendation: 'Configure your build tool to not upload source maps to the production server or restrict access via server headers.'
  },
  {
    id: '4',
    severity: 'medium',
    category: 'Routes',
    title: '/admin/debug Route Discovered',
    path: 'https://example.com/admin/debug',
    explanation: 'A debug route was found via client-side routing logic. This could expose system internals or sensitive metrics.',
    confidence: 85,
    evidence: '{ path: "/admin/debug", component: DebugView }',
    recommendation: 'Remove debug routes from production builds using conditional compilation (e.g., process.env.NODE_ENV).'
  },
  {
    id: '5',
    severity: 'low',
    category: 'Storage',
    title: 'Public S3 Bucket Reference',
    path: '/assets/hero.jpg',
    explanation: 'Reference to an S3 bucket found. If incorrectly configured, the entire bucket could be browsable.',
    confidence: 80,
    evidence: 's3.amazonaws.com/leaklens-assets-prod/...',
    recommendation: 'Verify that the S3 bucket has public access blocked and uses CloudFront with OAI if content must be served.'
  }
];
