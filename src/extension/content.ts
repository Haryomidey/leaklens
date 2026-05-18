import {Finding, FindingSeverity, ScanResult, ScanStep, Stat} from '../lib/scanTypes';

const MAX_EVIDENCE_LENGTH = 160;
const defaultScanSettings = {
  autoScan: true,
  overlays: true,
  lowConfidence: false,
  sourceMaps: true,
  buckets: true,
  configs: true,
};

type ScanSettings = typeof defaultScanSettings;

function mergeScanSettings(settings?: Partial<ScanSettings>): ScanSettings {
  return {...defaultScanSettings, ...settings};
}

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
    confidence: 94,
    explanation: 'A GitHub token-like value is present in client-visible code or markup.',
    recommendation: 'Revoke the token in GitHub, check recent repository activity, and move token use to a trusted backend.',
    regex: /gh[pousr]_[A-Za-z0-9_]{36,255}/g,
    severity: 'critical',
    title: 'GitHub Token Exposed',
  },
  {
    category: 'Secrets',
    confidence: 93,
    explanation: 'A Slack token-like value is present in client-visible code or markup.',
    recommendation: 'Revoke the Slack token, review app permissions, and avoid shipping workspace tokens to the browser.',
    regex: /xox[baprs]-[A-Za-z0-9-]{20,}/g,
    severity: 'critical',
    title: 'Slack Token Exposed',
  },
  {
    category: 'Secrets',
    confidence: 92,
    explanation: 'A SendGrid API key is present in client-visible code or markup.',
    recommendation: 'Rotate the SendGrid key and send mail only through a backend service.',
    regex: /SG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/g,
    severity: 'critical',
    title: 'SendGrid Key Exposed',
  },
  {
    category: 'Secrets',
    confidence: 90,
    explanation: 'A Twilio key or secret-like value is present in client-visible code or markup.',
    recommendation: 'Rotate the credential and keep Twilio calls server-side.',
    regex: /(?:SK|AC)[0-9a-fA-F]{32}/g,
    severity: 'high',
    title: 'Twilio Credential Exposed',
  },
  {
    category: 'Secrets',
    confidence: 89,
    explanation: 'A private key block appears to be embedded in page-visible content.',
    recommendation: 'Remove the private key immediately, rotate dependent credentials, and check deployment artifacts.',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]{20,}?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
    severity: 'critical',
    title: 'Private Key Exposed',
  },
  {
    category: 'Secrets',
    confidence: 78,
    explanation: 'A Sentry DSN is visible to the client. This is often public, but it can still allow noisy event injection if unrestricted.',
    recommendation: 'Confirm project rate limits, allowed domains, and data scrubbing rules are configured.',
    regex: /https:\/\/[a-f0-9]{32}@[a-z0-9.-]+\.ingest\.sentry\.io\/\d+/gi,
    severity: 'low',
    title: 'Sentry DSN Visible',
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

const riskyStorageKeys = /(token|secret|password|passwd|pwd|auth|session|jwt|api[_-]?key|access[_-]?key|refresh)/i;

function hasSecretLikeValue(value: string) {
  return secretPatterns.some(pattern => {
    pattern.regex.lastIndex = 0;
    return pattern.regex.test(value);
  });
}

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

function appendFindings(findings: Finding[], incoming: Finding[]) {
  for (const finding of incoming) {
    findings.push({
      ...finding,
      id: `${findings.length + 1}`,
    });
  }
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

function detectSensitiveBrowserStorage(findings: Finding[]) {
  let stores: Array<{name: string; storage: Storage}> = [];

  try {
    stores = [
      {name: 'localStorage', storage: window.localStorage},
      {name: 'sessionStorage', storage: window.sessionStorage},
    ];
  } catch {
    return;
  }

  for (const store of stores) {
    for (let index = 0; index < store.storage.length; index += 1) {
      const key = store.storage.key(index) ?? '';
      const value = store.storage.getItem(key) ?? '';

      if (!riskyStorageKeys.test(key) && !hasSecretLikeValue(value)) {
        continue;
      }

      makeFinding(findings, {
        severity: riskyStorageKeys.test(key) ? 'high' : 'medium',
        category: 'Browser Storage',
        title: 'Sensitive Value in Browser Storage',
        path: `${store.name}.${key}`,
        explanation: 'A token, key, password, or session-like value is stored where page scripts can read it.',
        confidence: 82,
        evidence: truncate(`${key}: ${value}`),
        recommendation: 'Avoid storing sensitive values in localStorage or sessionStorage. Prefer short-lived server sessions and HTTP-only cookies.',
      });
    }
  }
}

function detectInsecureForms(findings: Finding[]) {
  const forms = Array.from(document.forms);

  for (const form of forms) {
    const hasSensitiveInput = Boolean(form.querySelector('input[type="password"], input[name*="token" i], input[name*="secret" i], input[name*="email" i]'));
    const action = form.getAttribute('action') || window.location.href;
    const actionUrl = new URL(action, window.location.href);

    if (hasSensitiveInput && actionUrl.protocol === 'http:') {
      makeFinding(findings, {
        severity: 'high',
        category: 'Forms',
        title: 'Sensitive Form Uses HTTP',
        path: actionUrl.href,
        explanation: 'A form with sensitive fields submits over an unencrypted HTTP endpoint.',
        confidence: 90,
        evidence: truncate(form.outerHTML),
        recommendation: 'Submit sensitive forms over HTTPS only and redirect HTTP traffic to HTTPS.',
      });
    }

    const passwordInput = form.querySelector<HTMLInputElement>('input[type="password"]');
    if (passwordInput && passwordInput.autocomplete !== 'current-password' && passwordInput.autocomplete !== 'new-password') {
      makeFinding(findings, {
        severity: 'low',
        category: 'Forms',
        title: 'Password Field Missing Autocomplete Hint',
        path: actionUrl.href,
        explanation: 'A password field is missing a specific autocomplete value, which can hurt password-manager behavior.',
        confidence: 70,
        evidence: truncate(passwordInput.outerHTML),
        recommendation: 'Use autocomplete="current-password" or autocomplete="new-password" as appropriate.',
      });
    }
  }
}

function detectMixedContent(findings: Finding[]) {
  if (window.location.protocol !== 'https:') return;

  const selectors = [
    'script[src^="http:"]',
    'link[href^="http:"]',
    'img[src^="http:"]',
    'iframe[src^="http:"]',
    'audio[src^="http:"]',
    'video[src^="http:"]',
    'source[src^="http:"]',
  ];
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selectors.join(','))).slice(0, 6);

  for (const node of nodes) {
    const url = node.getAttribute('src') || node.getAttribute('href') || '';
    makeFinding(findings, {
      severity: node.tagName.toLowerCase() === 'script' ? 'high' : 'medium',
      category: 'Transport',
      title: 'Mixed Content Reference',
      path: new URL(url, window.location.href).href,
      explanation: 'An HTTPS page references an HTTP asset.',
      confidence: 88,
      evidence: truncate(node.outerHTML),
      recommendation: 'Load all assets over HTTPS and remove insecure HTTP references.',
    });
  }
}

function detectUnsafeExternalLinks(findings: Finding[]) {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"][href]'))
    .filter(link => {
      const rel = link.rel.toLowerCase();
      return !rel.includes('noopener') || !rel.includes('noreferrer');
    })
    .slice(0, 6);

  for (const link of links) {
    makeFinding(findings, {
      severity: 'low',
      category: 'Links',
      title: 'New Tab Link Missing rel Protection',
      path: new URL(link.href, window.location.href).href,
      explanation: 'A target="_blank" link is missing noopener or noreferrer protection.',
      confidence: 86,
      evidence: truncate(link.outerHTML),
      recommendation: 'Add rel="noopener noreferrer" to external links that open a new tab.',
    });
  }
}

function detectIframes(findings: Finding[]) {
  const iframes = Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe[src]'))
    .filter(iframe => !iframe.hasAttribute('sandbox'))
    .slice(0, 4);

  for (const iframe of iframes) {
    makeFinding(findings, {
      severity: 'medium',
      category: 'Frames',
      title: 'Iframe Without Sandbox',
      path: iframe.src,
      explanation: 'An embedded frame is not restricted with the sandbox attribute.',
      confidence: 76,
      evidence: truncate(iframe.outerHTML),
      recommendation: 'Add a least-privilege sandbox attribute to third-party or untrusted iframes.',
    });
  }
}

function detectMissingSecurityMeta(findings: Finding[]) {
  const hasCspMeta = Boolean(document.querySelector('meta[http-equiv="Content-Security-Policy" i]'));
  const hasReferrerPolicy = Boolean(document.querySelector('meta[name="referrer" i]'));

  if (!hasCspMeta) {
    makeFinding(findings, {
      severity: 'medium',
      category: 'Headers',
      title: 'No CSP Meta Tag Found',
      path: window.location.href,
      explanation: 'No Content Security Policy meta tag was found in the page markup. Header-based CSP may still exist, but it is not visible to this content script.',
      confidence: 55,
      evidence: '<meta http-equiv="Content-Security-Policy" ...> not found',
      recommendation: 'Use a Content Security Policy header where possible, or add a restrictive CSP meta tag as a fallback.',
    });
  }

  if (!hasReferrerPolicy) {
    makeFinding(findings, {
      severity: 'low',
      category: 'Headers',
      title: 'No Referrer Policy Meta Tag Found',
      path: window.location.href,
      explanation: 'No referrer policy meta tag was found in the page markup. A response header may still be present.',
      confidence: 52,
      evidence: '<meta name="referrer" ...> not found',
      recommendation: 'Set Referrer-Policy, preferably as an HTTP response header.',
    });
  }
}

function detectDomXssSignals(findings: Finding[]) {
  const textSources = collectPageText();
  const sinkRegex = /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(|document\.write(?:ln)?\s*\(|dangerouslySetInnerHTML|eval\s*\(|new Function\s*\(|setTimeout\s*\(\s*['"`]|setInterval\s*\(\s*['"`]/gi;
  const userInputRegex = /(location\.(?:hash|search|href)|document\.URL|document\.documentURI|window\.name|localStorage|sessionStorage)/i;

  for (const source of textSources) {
    const sinkMatch = source.text.match(sinkRegex)?.[0];
    if (!sinkMatch) continue;

    makeFinding(findings, {
      severity: userInputRegex.test(source.text) ? 'high' : 'medium',
      category: 'XSS',
      title: 'DOM XSS Sink Pattern',
      path: source.path,
      explanation: 'A script uses an HTML or code execution sink. This is a heuristic signal and needs manual review.',
      confidence: userInputRegex.test(source.text) ? 78 : 62,
      evidence: truncate(sinkMatch),
      recommendation: 'Avoid writing untrusted data into HTML sinks. Use textContent, safe DOM APIs, and strict sanitization where HTML is required.',
    });
  }
}

function detectOutdatedLibraryHints(findings: Finding[]) {
  const libraries = [
    {name: 'jQuery', regex: /jquery[/-](1\.|2\.|3\.[0-4]\.)/i, recommendation: 'Upgrade jQuery to a current patched release and retest dependent plugins.'},
    {name: 'AngularJS', regex: /angular(?:\.min)?\.js|angular[/-]1\./i, recommendation: 'Avoid AngularJS in new production apps or isolate it behind strong controls.'},
    {name: 'Bootstrap', regex: /bootstrap[/-](2\.|3\.)/i, recommendation: 'Upgrade Bootstrap and review plugin usage for known XSS issues.'},
  ];
  const assetUrls = [
    ...Array.from(document.scripts).map(script => script.src),
    ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[href]')).map(link => link.href),
  ];

  for (const url of assetUrls) {
    for (const library of libraries) {
      if (!library.regex.test(url)) continue;

      makeFinding(findings, {
        severity: 'medium',
        category: 'Dependencies',
        title: `Old ${library.name} Version Hint`,
        path: url,
        explanation: 'A script or stylesheet URL suggests an old frontend dependency may be in use.',
        confidence: 64,
        evidence: url,
        recommendation: library.recommendation,
      });
    }
  }
}

function collectAssetUrls() {
  return Array.from(new Set([
    ...Array.from(document.scripts).map(script => script.src).filter(Boolean),
    ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[href]')).map(link => link.href).filter(Boolean),
  ])).slice(0, 24);
}

async function getNetworkFindings(url: string, settings: ScanSettings) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'RUN_NETWORK_SCAN',
      assetUrls: collectAssetUrls(),
      settings,
      url,
    });
    return Array.isArray(response?.findings) ? response.findings as Finding[] : [];
  } catch {
    return [];
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
    {id: 'other', label: 'Other Issues', value: findings.filter(finding => finding.category !== 'Secrets' && finding.category !== 'Routes').length},
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
      name: 'Page Hardening',
      status: count('Storage') + count('Source Maps') + count('Browser Storage') + count('Forms') + count('Transport') + count('Links') + count('Frames') + count('Headers') > 0 ? 'warning' : 'complete',
      description: `${count('Storage') + count('Source Maps') + count('Browser Storage') + count('Forms') + count('Transport') + count('Links') + count('Frames') + count('Headers')} extra page issue${count('Storage') + count('Source Maps') + count('Browser Storage') + count('Forms') + count('Transport') + count('Links') + count('Frames') + count('Headers') === 1 ? '' : 's'} found.`,
    },
  ];
}

async function runScan(settingsInput?: Partial<ScanSettings>): Promise<ScanResult> {
  const settings = mergeScanSettings(settingsInput);
  const findings: Finding[] = [];

  detectSecrets(findings);
  if (settings.configs) {
    detectConfigs(findings);
  }
  if (settings.sourceMaps) {
    detectSourceMaps(findings);
  }
  detectRoutes(findings);
  if (settings.buckets) {
    detectStorage(findings);
  }
  detectSensitiveBrowserStorage(findings);
  detectInsecureForms(findings);
  detectMixedContent(findings);
  detectUnsafeExternalLinks(findings);
  detectIframes(findings);
  detectMissingSecurityMeta(findings);
  detectDomXssSignals(findings);
  detectOutdatedLibraryHints(findings);
  appendFindings(findings, await getNetworkFindings(window.location.href, settings));

  const visibleFindings = settings.lowConfidence
    ? findings
    : findings.filter(finding => finding.confidence >= 60);

  const hostname = window.location.hostname || 'Current page';

  return {
    url: window.location.href,
    hostname,
    scannedAt: new Date().toISOString(),
    score: calculateScore(visibleFindings),
    findings: visibleFindings,
    stats: buildStats(visibleFindings),
    steps: buildSteps(visibleFindings),
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'RUN_SCAN') {
    void runScan(request.settings as Partial<ScanSettings> | undefined).then(result => {
      sendResponse({result});
    });
    return true;
  }

  if (request.action === 'PING') {
    sendResponse({pong: true});
  }
});
