import {Finding, FindingSeverity, ScanResult, ScanStep, Stat} from '../lib/scanTypes';

const MAX_EVIDENCE_LENGTH = 160;

const secretPatterns: Array<{
  category: string;
  confidence: number;
  explanation: string;
  recommendation: string;
  regex: RegExp;
  severity: FindingSeverity;
  title: string;
}> = [
  {
    category: 'Secrets',
    confidence: 98,
    explanation: 'A Google-style API key is present in client-visible code or markup.',
    recommendation: 'Restrict the key by referrer, rotate it if it is production-facing, and move sensitive calls behind a server boundary.',
    regex: /AIza[0-9A-Za-z_-]{35}/g,
    severity: 'critical',
    title: 'Google API Key Exposed',
  },
  {
    category: 'Secrets',
    confidence: 98,
    explanation: 'An AWS access key id is present in client-visible code or markup.',
    recommendation: 'Disable or rotate the credential immediately and audit recent cloud activity.',
    regex: /A(?:KIA|SIA)[0-9A-Z]{16}/g,
    severity: 'critical',
    title: 'AWS Access Key Exposed',
  },
  {
    category: 'Secrets',
    confidence: 95,
    explanation: 'A Stripe secret key appears to be exposed to the browser.',
    recommendation: 'Rotate the key and ensure secret-key operations are performed only on trusted backend services.',
    regex: /sk_(?:live|test)_[0-9A-Za-z]{20,}/g,
    severity: 'critical',
    title: 'Stripe Secret Key Exposed',
  },
  {
    category: 'Secrets',
    confidence: 86,
    explanation: 'A JWT-like token is present in the page source.',
    recommendation: 'Avoid embedding long-lived tokens in client code. Use short-lived sessions and HTTP-only cookies where possible.',
    regex: /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
    severity: 'high',
    title: 'JWT Token Exposed',
  },
];

function truncate(value: string) {
  const compact = value.replace(/\s+/g, ' ').trim();
  return compact.length > MAX_EVIDENCE_LENGTH ? `${compact.slice(0, MAX_EVIDENCE_LENGTH)}...` : compact;
}

function makeFinding(
  findings: Finding[],
  data: Omit<Finding, 'id'>,
) {
  findings.push({
    id: `${findings.length + 1}`,
    ...data,
  });
}

function collectPageText() {
  const inlineScripts = Array.from(document.scripts)
    .filter(script => !script.src)
    .map((script, index) => ({
      path: `inline script #${index + 1}`,
      text: script.textContent ?? '',
    }));

  const markup = {
    path: window.location.href,
    text: document.documentElement.outerHTML,
  };

  return [markup, ...inlineScripts];
}

function detectSecrets(findings: Finding[]) {
  for (const source of collectPageText()) {
    for (const pattern of secretPatterns) {
      const matches = source.text.match(pattern.regex) ?? [];

      for (const match of Array.from(new Set(matches)).slice(0, 4)) {
        makeFinding(findings, {
          severity: pattern.severity,
          category: pattern.category,
          title: pattern.title,
          path: source.path,
          explanation: pattern.explanation,
          confidence: pattern.confidence,
          evidence: truncate(match),
          recommendation: pattern.recommendation,
        });
      }
    }
  }
}

function detectConfigs(findings: Finding[]) {
  const configRegex = /(firebaseConfig|initializeApp|supabaseUrl|supabaseKey|NEXT_PUBLIC_[A-Z0-9_]+|VITE_[A-Z0-9_]+)/gi;

  for (const source of collectPageText()) {
    const match = source.text.match(configRegex)?.[0];

    if (!match) continue;

    makeFinding(findings, {
      severity: 'medium',
      category: 'Config',
      title: 'Public Client Configuration Detected',
      path: source.path,
      explanation: 'A public application configuration marker was found in client-visible code.',
      confidence: 78,
      evidence: truncate(match),
      recommendation: 'Review the referenced configuration and confirm that no privileged values are shipped to the browser.',
    });
    return;
  }
}

function detectSourceMaps(findings: Finding[]) {
  const scripts = Array.from(document.scripts).filter(script => script.src);
  const sourceMapComment = collectPageText().find(source => /sourceMappingURL=/i.test(source.text));

  if (sourceMapComment) {
    makeFinding(findings, {
      severity: 'high',
      category: 'Source Maps',
      title: 'Source Map Reference Found',
      path: sourceMapComment.path,
      explanation: 'A source map reference can reveal original source code when the map file is publicly served.',
      confidence: 90,
      evidence: 'sourceMappingURL',
      recommendation: 'Disable public source maps in production or protect them behind authenticated access.',
    });
  }

  for (const script of scripts) {
    if (script.src.endsWith('.map') || script.src.includes('.js.map')) {
      makeFinding(findings, {
        severity: 'high',
        category: 'Source Maps',
        title: 'Source Map Asset Loaded',
        path: script.src,
        explanation: 'A source map asset was directly referenced by the page.',
        confidence: 98,
        evidence: script.src,
        recommendation: 'Remove source map assets from public production deployments.',
      });
    }
  }
}

function detectRoutes(findings: Finding[]) {
  const routeRegex = /\/(?:admin|debug|internal|devtools|staging|graphql|api\/debug)[A-Za-z0-9/_-]*/gi;
  const text = document.documentElement.outerHTML;
  const routes = Array.from(new Set(text.match(routeRegex) ?? [])).slice(0, 6);

  for (const route of routes) {
    makeFinding(findings, {
      severity: /debug|internal|devtools/i.test(route) ? 'high' : 'medium',
      category: 'Routes',
      title: 'Sensitive Route Reference Found',
      path: new URL(route, window.location.href).href,
      explanation: 'A route name associated with administration, debugging, or internal tooling is visible to the client.',
      confidence: 82,
      evidence: route,
      recommendation: 'Confirm the route is protected server-side and remove debug-only routes from production bundles.',
    });
  }
}

function detectStorage(findings: Finding[]) {
  const storageRegex = /https?:\/\/[^\s"'<>]*(?:s3\.amazonaws\.com|storage\.googleapis\.com|blob\.core\.windows\.net)[^\s"'<>]*/gi;
  const matches = Array.from(new Set(document.documentElement.outerHTML.match(storageRegex) ?? [])).slice(0, 4);

  for (const match of matches) {
    makeFinding(findings, {
      severity: 'low',
      category: 'Storage',
      title: 'Cloud Storage URL Found',
      path: match,
      explanation: 'A public cloud storage URL is referenced by the page.',
      confidence: 74,
      evidence: truncate(match),
      recommendation: 'Verify bucket access policies and avoid exposing browsable storage paths.',
    });
  }
}

function calculateScore(findings: Finding[]) {
  const weight = {critical: 35, high: 24, medium: 14, low: 7};
  return Math.min(100, findings.reduce((score, finding) => score + weight[finding.severity], 0));
}

function buildStats(findings: Finding[]): Stat[] {
  return [
    {id: 'secrets', label: 'Secrets Found', value: findings.filter(finding => finding.category === 'Secrets').length},
    {id: 'routes', label: 'Exposed Routes', value: findings.filter(finding => finding.category === 'Routes').length},
    {id: 'sourcemaps', label: 'Source Maps', value: findings.filter(finding => finding.category === 'Source Maps').length},
  ];
}

function buildSteps(findings: Finding[]): ScanStep[] {
  const count = (category: string) => findings.filter(finding => finding.category === category).length;
  const scripts = document.scripts.length;

  return [
    {
      id: 'scripts',
      name: 'Script Analysis',
      status: 'complete',
      description: `Analyzed ${scripts} script${scripts === 1 ? '' : 's'} and the current DOM.`,
    },
    {
      id: 'secrets',
      name: 'Secret Detection',
      status: count('Secrets') > 0 ? 'warning' : 'complete',
      description: `${count('Secrets')} exposed secret pattern${count('Secrets') === 1 ? '' : 's'} found.`,
    },
    {
      id: 'routes',
      name: 'Route Inspection',
      status: count('Routes') > 0 ? 'warning' : 'complete',
      description: `${count('Routes')} sensitive route reference${count('Routes') === 1 ? '' : 's'} found.`,
    },
    {
      id: 'storage',
      name: 'Storage & Source Maps',
      status: count('Storage') + count('Source Maps') > 0 ? 'warning' : 'complete',
      description: `${count('Storage')} storage URL${count('Storage') === 1 ? '' : 's'} and ${count('Source Maps')} source map signal${count('Source Maps') === 1 ? '' : 's'} found.`,
    },
  ];
}

function runScan(): ScanResult {
  const findings: Finding[] = [];

  detectSecrets(findings);
  detectConfigs(findings);
  detectSourceMaps(findings);
  detectRoutes(findings);
  detectStorage(findings);

  const hostname = window.location.hostname || 'Current page';

  return {
    url: window.location.href,
    hostname,
    scannedAt: new Date().toISOString(),
    score: calculateScore(findings),
    findings,
    stats: buildStats(findings),
    steps: buildSteps(findings),
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'RUN_SCAN') {
    sendResponse({result: runScan()});
  }

  if (request.action === 'PING') {
    sendResponse({pong: true});
  }
});