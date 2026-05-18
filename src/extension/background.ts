import {Finding} from '../lib/scanTypes';

type ScanSettings = {
  activeVerification?: boolean;
  authProfile?: 'anonymous' | 'currentSession';
  bundleAnalysis?: boolean;
  dependencyCves?: boolean;
  severityMode?: 'serious' | 'audit';
  sourceMaps?: boolean;
};

type VulnerableLibrary = {
  cves: string[];
  fixedIn: string;
  name: string;
  range: (version: string) => boolean;
  recommendation: string;
  severity: 'critical' | 'high' | 'medium';
};

const exposedFileChecks = [
  {
    path: '/.env',
    title: 'Public .env File',
    severity: 'critical' as const,
    recommendation: 'Remove the file from public hosting and rotate any values that were exposed.',
  },
  {
    path: '/.git/config',
    title: 'Public Git Config',
    severity: 'high' as const,
    recommendation: 'Block access to .git paths and review the repository for exposed history or credentials.',
  },
  {
    path: '/.git/HEAD',
    title: 'Public Git Repository Metadata',
    severity: 'high' as const,
    recommendation: 'Block access to .git paths and review the repository for exposed history or credentials.',
  },
  {
    path: '/config.json',
    title: 'Public Config File',
    severity: 'medium' as const,
    recommendation: 'Review the file contents and avoid exposing privileged configuration in public assets.',
  },
  {
    path: '/firebase.json',
    title: 'Public Firebase Config File',
    severity: 'medium' as const,
    recommendation: 'Confirm Firebase rules are strict and remove deployment-only config from public hosting.',
  },
  {
    path: '/package.json',
    title: 'Public Package Manifest',
    severity: 'low' as const,
    recommendation: 'Avoid publishing package metadata unless it is intentionally public.',
  },
  {
    path: '/swagger.json',
    title: 'Public Swagger Schema',
    severity: 'medium' as const,
    recommendation: 'Keep API schemas behind authentication when they reveal private endpoints.',
  },
  {
    path: '/openapi.json',
    title: 'Public OpenAPI Schema',
    severity: 'medium' as const,
    recommendation: 'Keep API schemas behind authentication when they reveal private endpoints.',
  },
  {
    path: '/.npmrc',
    title: 'Public npm Config',
    severity: 'high' as const,
    recommendation: 'Remove the file from public hosting and rotate any registry tokens that were exposed.',
  },
  {
    path: '/.env.local',
    title: 'Public Local Environment File',
    severity: 'critical' as const,
    recommendation: 'Remove the file from public hosting and rotate any values that were exposed.',
  },
  {
    path: '/.env.production',
    title: 'Public Production Environment File',
    severity: 'critical' as const,
    recommendation: 'Remove the file from public hosting and rotate any values that were exposed.',
  },
  {
    path: '/backup.zip',
    title: 'Public Backup Archive',
    severity: 'high' as const,
    recommendation: 'Remove public backup archives and review them for leaked source code or credentials.',
  },
  {
    path: '/backup.sql',
    title: 'Public Database Backup',
    severity: 'critical' as const,
    recommendation: 'Remove public database backups and rotate any exposed credentials or user secrets.',
  },
  {
    path: '/dump.sql',
    title: 'Public Database Dump',
    severity: 'critical' as const,
    recommendation: 'Remove public database dumps and rotate any exposed credentials or user secrets.',
  },
];

const bundleSecretPatterns = [
  {title: 'API Key Pattern in JS Bundle', regex: /AIza[0-9A-Za-z_-]{35}|gh[pousr]_[A-Za-z0-9_]{36,255}|sk_(?:live|test)_[0-9A-Za-z]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}/g},
  {title: 'Private Key Marker in JS Bundle', regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g},
  {title: 'JWT Pattern in JS Bundle', regex: /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g},
];

const sensitiveBundleRouteRegex = /\/(?:admin|debug|internal|devtools|staging|graphql|api\/debug)[A-Za-z0-9/_-]*/gi;
const endpointPathRegex = /\/(?:api|admin|graphql|debug|internal|devtools|staging|v\d+)[A-Za-z0-9/?&=._~:%#-]*/gi;
const libraryVersionRegexes = [
  {name: 'jquery', regex: /jquery(?:\.min)?[-.]([0-9]+\.[0-9]+\.[0-9]+)|jQuery v([0-9]+\.[0-9]+\.[0-9]+)/i},
  {name: 'lodash', regex: /lodash(?:\.min)?[-.]([0-9]+\.[0-9]+\.[0-9]+)|lodash v?([0-9]+\.[0-9]+\.[0-9]+)/i},
  {name: 'bootstrap', regex: /bootstrap(?:\.bundle|\.min)?[-.]([0-9]+\.[0-9]+\.[0-9]+)|Bootstrap v([0-9]+\.[0-9]+\.[0-9]+)/i},
  {name: 'angular', regex: /angular(?:\.min)?[-.]([0-9]+\.[0-9]+\.[0-9]+)|AngularJS v([0-9]+\.[0-9]+\.[0-9]+)/i},
];
const vulnerableLibraries: VulnerableLibrary[] = [
  {
    name: 'jquery',
    cves: ['CVE-2020-11022', 'CVE-2020-11023'],
    fixedIn: '3.5.0',
    range: version => compareVersions(version, '3.5.0') < 0,
    recommendation: 'Upgrade jQuery to 3.5.0 or newer and retest plugins that process HTML.',
    severity: 'high',
  },
  {
    name: 'lodash',
    cves: ['CVE-2019-10744', 'CVE-2020-8203', 'CVE-2021-23337'],
    fixedIn: '4.17.21',
    range: version => compareVersions(version, '4.17.21') < 0,
    recommendation: 'Upgrade lodash to 4.17.21 or newer.',
    severity: 'high',
  },
  {
    name: 'bootstrap',
    cves: ['CVE-2019-8331'],
    fixedIn: '3.4.1 / 4.3.1',
    range: version => compareVersions(version, '3.4.1') < 0 || (version.startsWith('4.') && compareVersions(version, '4.3.1') < 0),
    recommendation: 'Upgrade Bootstrap to a patched release and review tooltip/popover sanitization.',
    severity: 'medium',
  },
  {
    name: 'angular',
    cves: ['AngularJS EOL'],
    fixedIn: 'Not applicable',
    range: version => version.startsWith('1.'),
    recommendation: 'AngularJS is end-of-life. Migrate or isolate the app behind strong controls.',
    severity: 'high',
  },
];

function makeFinding(findings: Finding[], data: Omit<Finding, 'id'>) {
  findings.push({
    id: `network-${findings.length + 1}`,
    ...data,
  });
}

function truncate(value: string) {
  const compact = value.replace(/\s+/g, ' ').trim();
  return compact.length > 160 ? `${compact.slice(0, 160)}...` : compact;
}

function compareVersions(left: string, right: string) {
  const a = left.split('.').map(part => Number.parseInt(part, 10) || 0);
  const b = right.split('.').map(part => Number.parseInt(part, 10) || 0);

  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const diff = (a[index] ?? 0) - (b[index] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

function requestCredentials(settings?: ScanSettings): RequestCredentials {
  return settings?.authProfile === 'anonymous' ? 'omit' : 'include';
}

function headerValue(headers: Headers, name: string) {
  return headers.get(name) ?? headers.get(name.toLowerCase());
}

function cspDirective(csp: string, name: string) {
  const directive = csp
    .split(';')
    .map(part => part.trim())
    .find(part => part.toLowerCase().startsWith(`${name.toLowerCase()} `));

  return directive?.slice(name.length).trim() ?? '';
}

function hasLooseScriptPolicy(csp: string) {
  const scriptPolicy = cspDirective(csp, 'script-src') || cspDirective(csp, 'default-src');
  if (!scriptPolicy) return false;

  const hasNonceOrHash = /'(?:nonce-[^']+|sha(?:256|384|512)-[^']+)'/i.test(scriptPolicy);
  const hasStrictDynamic = /'strict-dynamic'/i.test(scriptPolicy);

  return (
    /'unsafe-eval'|\s\*\s|\s\*:|^(\*|\*:)/i.test(` ${scriptPolicy} `) ||
    (/'unsafe-inline'/i.test(scriptPolicy) && !hasNonceOrHash && !hasStrictDynamic)
  );
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, settings?: ScanSettings) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 3500);

  try {
    return await fetch(url, {
      cache: 'no-store',
      credentials: requestCredentials(settings),
      redirect: 'follow',
      ...options,
      signal: controller.signal,
    });
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function detectResponseHeaders(url: string, findings: Finding[], settings?: ScanSettings) {
  const response = await fetchWithTimeout(url, {method: 'HEAD'}, settings);
  const headers = response.headers;

  const csp = headerValue(headers, 'content-security-policy');
  if (csp && hasLooseScriptPolicy(csp)) {
    makeFinding(findings, {
      severity: 'medium',
      category: 'Headers',
      title: 'Loose CSP Header',
      path: url,
      explanation: 'The Content Security Policy allows broad or unsafe script execution.',
      confidence: 76,
      evidence: csp.slice(0, 160),
      recommendation: 'Tighten script-src/default-src directives and avoid unsafe-inline, unsafe-eval, and broad wildcards.',
    });
  }

  const acao = headerValue(headers, 'access-control-allow-origin');
  const acac = headerValue(headers, 'access-control-allow-credentials');
  if (acao === '*' && acac?.toLowerCase() === 'true') {
    makeFinding(findings, {
      severity: 'high',
      category: 'CORS',
      title: 'Risky CORS Header Combination',
      path: url,
      explanation: 'The response advertises wildcard origins with credentials enabled.',
      confidence: 80,
      evidence: 'Access-Control-Allow-Origin: *; Access-Control-Allow-Credentials: true',
      recommendation: 'Do not combine wildcard origins with credentials. Allow only trusted origins.',
    });
  }
}

async function detectExposedFiles(url: string, findings: Finding[], settings?: ScanSettings) {
  const origin = new URL(url).origin;

  await Promise.all(exposedFileChecks.map(async check => {
    const target = `${origin}${check.path}`;

    try {
      const response = await fetchWithTimeout(target, {method: 'GET', headers: {Range: 'bytes=0-2048'}}, settings);
      if (!response.ok) return;

      const contentType = response.headers.get('content-type') ?? '';
      const text = await response.text();
      const looksLikeHtmlFallback = /text\/html/i.test(contentType) && /<html|<!doctype/i.test(text);
      if (looksLikeHtmlFallback) return;

      makeFinding(findings, {
        severity: check.severity,
        category: 'Exposure',
        title: check.title,
        path: target,
        explanation: 'A sensitive or deployment-related file appears to be publicly reachable.',
        confidence: check.path === '/package.json' ? 65 : 84,
        evidence: text.slice(0, 160) || `${response.status} ${response.statusText}`,
        recommendation: check.recommendation,
      });
    } catch {
      // Ignore failed probes. These checks are best-effort and intentionally quiet.
    }
  }));
}

function isSameOrigin(url: string, origin: string) {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
}

function resolveSourceMapUrl(scriptUrl: string, mapRef: string) {
  try {
    return new URL(mapRef.trim(), scriptUrl).href;
  } catch {
    return '';
  }
}

function isSensitiveEndpointPath(pathname: string) {
  return /\/(?:api|admin|graphql|debug|internal|devtools|staging|v\d+)/i.test(pathname);
}

function extractJsStrings(text: string) {
  const strings: string[] = [];
  const stringRegex = /(['"`])((?:\\.|(?!\1)[^\\]){2,240})\1/g;
  let match: RegExpExecArray | null;

  while ((match = stringRegex.exec(text))) {
    strings.push(match[2].replace(/\\\//g, '/'));
    if (strings.length >= 400) break;
  }

  return strings;
}

function fingerprintLibraries(source: string, path: string) {
  return libraryVersionRegexes.flatMap(library => {
    const match = `${path}\n${source.slice(0, 20000)}`.match(library.regex);
    const version = match?.[1] || match?.[2];
    return version ? [{name: library.name, version}] : [];
  });
}

function detectVulnerableLibraries(source: string, path: string, findings: Finding[]) {
  for (const library of fingerprintLibraries(source, path)) {
    for (const vulnerability of vulnerableLibraries) {
      if (library.name !== vulnerability.name || !vulnerability.range(library.version)) continue;

      makeFinding(findings, {
        severity: vulnerability.severity,
        category: 'Dependencies',
        title: `Known Vulnerable ${library.name} Version`,
        path,
        explanation: `${library.name} ${library.version} matches known vulnerable dependency advisories.`,
        confidence: 84,
        evidence: `${library.name} ${library.version}; ${vulnerability.cves.join(', ')}; fixed in ${vulnerability.fixedIn}`,
        recommendation: vulnerability.recommendation,
      });
    }
  }
}

function collectBundleEndpoints(text: string, scriptUrl: string) {
  const fromStrings = extractJsStrings(text)
    .filter(value => /^(?:https?:\/\/|\/)(?:api|admin|graphql|debug|internal|devtools|staging|v\d+|[A-Za-z0-9_-]+\/(?:api|graphql))/i.test(value))
    .map(value => {
      try {
        return new URL(value, scriptUrl).href;
      } catch {
        return '';
      }
    });

  const fromRegex = Array.from(new Set(text.match(endpointPathRegex) ?? []))
    .map(value => {
      try {
        return new URL(value, scriptUrl).href;
      } catch {
        return '';
      }
    });

  return Array.from(new Set([...fromStrings, ...fromRegex].filter(Boolean))).slice(0, 30);
}

async function detectJavascriptBundles(pageUrl: string, assetUrls: string[], findings: Finding[], settings?: ScanSettings) {
  const origin = new URL(pageUrl).origin;
  const scripts = assetUrls
    .filter(url => /\.m?js(?:[?#].*)?$/i.test(url))
    .filter(url => isSameOrigin(url, origin))
    .slice(0, 10);

  await Promise.all(scripts.map(async scriptUrl => {
    try {
      const response = await fetchWithTimeout(scriptUrl, {}, settings);
      if (!response.ok) return;

      const text = await response.text();
      if (settings?.bundleAnalysis !== false) {
        for (const pattern of bundleSecretPatterns) {
          const matches = Array.from(new Set(text.match(pattern.regex) ?? [])).slice(0, 3);
          for (const match of matches) {
            makeFinding(findings, {
              severity: pattern.title.includes('JWT') ? 'high' : 'critical',
              category: 'Bundle',
              title: pattern.title,
              path: scriptUrl,
              explanation: 'A same-origin JavaScript bundle contains a token or secret-like value.',
              confidence: 84,
              evidence: truncate(match),
              recommendation: 'Remove secrets from frontend bundles and rotate exposed credentials if this is a real value.',
            });
          }
        }

        const routes = Array.from(new Set(text.match(sensitiveBundleRouteRegex) ?? [])).slice(0, 6);
        for (const route of routes) {
          makeFinding(findings, {
            severity: /debug|internal|devtools/i.test(route) ? 'high' : 'medium',
            category: 'Bundle',
            title: 'Sensitive Route in JS Bundle',
            path: scriptUrl,
            explanation: 'A same-origin JavaScript bundle references a sensitive-looking route.',
            confidence: 76,
            evidence: route,
            recommendation: 'Confirm sensitive routes are protected server-side and keep debug routes out of production bundles.',
          });
        }
      }

      if (settings?.dependencyCves !== false) {
        detectVulnerableLibraries(text, scriptUrl, findings);
      }

      if (settings?.sourceMaps === false) return;

      const mapRef = text.match(/sourceMappingURL=([^\s*]+)/)?.[1];
      const mapUrl = mapRef ? resolveSourceMapUrl(scriptUrl, mapRef) : `${scriptUrl}.map`;
      if (!mapUrl || !isSameOrigin(mapUrl, origin)) return;

      const mapResponse = await fetchWithTimeout(mapUrl, {headers: {Range: 'bytes=0-2048'}}, settings);
      if (!mapResponse.ok) return;

      const mapText = await mapResponse.text();
      if (!/"sources"|"version"\s*:\s*3/.test(mapText)) return;

      makeFinding(findings, {
        severity: 'high',
        category: 'Source Maps',
        title: 'Public Source Map File',
        path: mapUrl,
        explanation: 'A source map file for a same-origin JavaScript bundle is publicly reachable.',
        confidence: 88,
        evidence: truncate(mapText),
        recommendation: 'Do not publish production source maps publicly, or protect them behind authenticated access.',
      });
    } catch {
      // Bundle checks are best-effort and intentionally bounded.
    }
  }));
}

async function verifyDiscoveredEndpoints(pageUrl: string, discoveredUrls: string[], assetUrls: string[], findings: Finding[], settings?: ScanSettings) {
  if (settings?.activeVerification === false) return;

  const origin = new URL(pageUrl).origin;
  const candidateUrls = [
    ...discoveredUrls,
    ...assetUrls,
  ]
    .flatMap(url => {
      try {
        return [new URL(url, pageUrl).href];
      } catch {
        return [];
      }
    })
    .filter(url => {
      const parsed = new URL(url);
      return parsed.origin === origin && isSensitiveEndpointPath(parsed.pathname);
    });

  const bundleEndpointCandidates = assetUrls.filter(url => /\.m?js(?:[?#].*)?$/i.test(url)).slice(0, 5);
  for (const scriptUrl of bundleEndpointCandidates) {
    try {
      const response = await fetchWithTimeout(scriptUrl, {}, settings);
      if (!response.ok) continue;
      candidateUrls.push(...collectBundleEndpoints(await response.text(), scriptUrl));
    } catch {
      // Endpoint extraction is best-effort.
    }
  }

  const targets = Array.from(new Set(candidateUrls))
    .filter(url => {
      try {
        const parsed = new URL(url);
        return parsed.origin === origin && !/\.(?:js|css|png|jpe?g|gif|svg|webp|woff2?|map)(?:[?#].*)?$/i.test(parsed.pathname);
      } catch {
        return false;
      }
    })
    .slice(0, 16);

  await Promise.all(targets.map(async target => {
    try {
      const response = await fetchWithTimeout(target, {method: 'GET', headers: {Range: 'bytes=0-2048'}}, settings);
      if ([401, 403, 404, 405].includes(response.status)) return;

      const contentType = response.headers.get('content-type') ?? '';
      const text = await response.text();
      const looksLikeHtmlShell = /text\/html/i.test(contentType) && /<html|<!doctype/i.test(text) && !/\/(?:api|graphql|debug|internal|admin)/i.test(target);
      if (looksLikeHtmlShell) return;

      const sensitiveStatus = response.ok || response.status >= 500;
      if (!sensitiveStatus) return;

      makeFinding(findings, {
        severity: /\/(?:admin|debug|internal|devtools)/i.test(target) ? 'high' : 'medium',
        category: 'API',
        title: 'Reachable Sensitive Endpoint',
        path: target,
        explanation: 'A sensitive-looking endpoint discovered from the page or JavaScript bundle responded to an active verification request.',
        confidence: 82,
        evidence: truncate(`${response.status} ${response.statusText}; ${text.slice(0, 120)}`),
        recommendation: 'Confirm this endpoint requires authorization and does not expose sensitive data to unintended users.',
      });
    } catch {
      // Active endpoint verification is best-effort.
    }
  }));
}

async function detectCookieIssues(url: string, findings: Finding[]) {
  if (typeof chrome === 'undefined' || !chrome.cookies?.getAll) return;

  const pageUrl = new URL(url);
  const cookies = await chrome.cookies.getAll({url});
  const sensitiveCookieName = /(session|auth|token|jwt|sid|csrf|xsrf|refresh)/i;

  for (const cookie of cookies.slice(0, 40)) {
    const isSensitive = sensitiveCookieName.test(cookie.name);

    if (isSensitive && pageUrl.protocol === 'https:' && !cookie.secure) {
      makeFinding(findings, {
        severity: 'high',
        category: 'Cookies',
        title: 'Sensitive Cookie Missing Secure Flag',
        path: `${cookie.domain}${cookie.path}`,
        explanation: 'A session, auth, or token-like cookie available on an HTTPS site is not marked Secure.',
        confidence: 82,
        evidence: cookie.name,
        recommendation: 'Set the Secure flag on authentication and session cookies used by HTTPS pages.',
      });
    }

    if (isSensitive && !cookie.httpOnly) {
      makeFinding(findings, {
        severity: 'high',
        category: 'Cookies',
        title: 'Sensitive Cookie Readable by JavaScript',
        path: `${cookie.domain}${cookie.path}`,
        explanation: 'A session, auth, or token-like cookie is not marked HttpOnly.',
        confidence: 86,
        evidence: cookie.name,
        recommendation: 'Set HttpOnly on sensitive cookies so page scripts cannot read them.',
      });
    }

    if (isSensitive && cookie.sameSite === 'no_restriction' && !cookie.secure) {
      makeFinding(findings, {
        severity: 'high',
        category: 'Cookies',
        title: 'Sensitive SameSite=None Cookie Without Secure',
        path: `${cookie.domain}${cookie.path}`,
        explanation: 'A sensitive SameSite=None cookie should also be marked Secure.',
        confidence: 80,
        evidence: cookie.name,
        recommendation: 'Set Secure on sensitive SameSite=None cookies or use Lax/Strict when cross-site use is not needed.',
      });
    }
  }
}

async function detectGraphqlIntrospection(url: string, findings: Finding[], settings?: ScanSettings) {
  const origin = new URL(url).origin;
  const target = `${origin}/graphql`;
  const query = 'query LeakLensIntrospectionProbe { __schema { queryType { name } mutationType { name } types { name } } }';

  try {
    const response = await fetchWithTimeout(target, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({query}),
    }, settings);

    if (!response.ok) return;

    const contentType = response.headers.get('content-type') ?? '';
    if (!/json/i.test(contentType)) return;

    const data = await response.json();
    const schema = data?.data?.__schema;
    if (!schema?.queryType?.name || !Array.isArray(schema.types)) return;

    makeFinding(findings, {
      severity: 'medium',
      category: 'API',
      title: 'Public GraphQL Introspection Enabled',
      path: target,
      explanation: 'The GraphQL endpoint exposes its schema to unauthenticated requests.',
      confidence: 86,
      evidence: truncate(JSON.stringify({queryType: schema.queryType, mutationType: schema.mutationType, typeCount: schema.types.length})),
      recommendation: 'Disable introspection for unauthenticated production requests or require authorization for schema discovery.',
    });
  } catch {
    // GraphQL probing is best-effort.
  }
}

async function runNetworkScan(url: string, assetUrls: string[] = [], discoveredUrls: string[] = [], settings?: ScanSettings) {
  const findings: Finding[] = [];

  try {
    await detectResponseHeaders(url, findings, settings);
  } catch {
    // Header checks are best-effort.
  }

  try {
    await detectExposedFiles(url, findings, settings);
  } catch {
    // Exposed-file checks are best-effort.
  }

  try {
    await detectJavascriptBundles(url, assetUrls, findings, settings);
  } catch {
    // Bundle checks are best-effort.
  }

  try {
    await detectCookieIssues(url, findings);
  } catch {
    // Cookie checks are best-effort.
  }

  try {
    await detectGraphqlIntrospection(url, findings, settings);
  } catch {
    // API checks are best-effort.
  }

  try {
    await verifyDiscoveredEndpoints(url, discoveredUrls, assetUrls, findings, settings);
  } catch {
    // Active verification checks are best-effort.
  }

  return settings?.severityMode === 'audit'
    ? findings
    : findings.filter(finding => finding.severity !== 'low');
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('LeakLens extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_SCAN_STATUS') {
    sendResponse({status: 'idle'});
    return;
  }

  if (request.action === 'RUN_NETWORK_SCAN' && typeof request.url === 'string') {
    const assetUrls = Array.isArray(request.assetUrls) ? request.assetUrls.filter(item => typeof item === 'string') as string[] : [];
    const discoveredUrls = Array.isArray(request.discoveredUrls) ? request.discoveredUrls.filter(item => typeof item === 'string') as string[] : [];
    const settings = typeof request.settings === 'object' && request.settings ? request.settings as ScanSettings : undefined;
    void runNetworkScan(request.url, assetUrls, discoveredUrls, settings).then(findings => {
      sendResponse({findings});
    });
    return true;
  }
});
