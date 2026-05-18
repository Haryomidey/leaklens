import {Finding} from '../lib/scanTypes';

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
    path: '/backup.zip',
    title: 'Public Backup Archive',
    severity: 'high' as const,
    recommendation: 'Remove public backup archives and review them for leaked source code or credentials.',
  },
];

const bundleSecretPatterns = [
  {title: 'API Key Pattern in JS Bundle', regex: /AIza[0-9A-Za-z_-]{35}|gh[pousr]_[A-Za-z0-9_]{36,255}|sk_(?:live|test)_[0-9A-Za-z]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}/g},
  {title: 'Private Key Marker in JS Bundle', regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g},
  {title: 'JWT Pattern in JS Bundle', regex: /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g},
];

const sensitiveBundleRouteRegex = /\/(?:admin|debug|internal|devtools|staging|graphql|api\/debug)[A-Za-z0-9/_-]*/gi;

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

function headerValue(headers: Headers, name: string) {
  return headers.get(name) ?? headers.get(name.toLowerCase());
}

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 3500);

  try {
    return await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      ...options,
      signal: controller.signal,
    });
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function detectResponseHeaders(url: string, findings: Finding[]) {
  const response = await fetchWithTimeout(url, {method: 'HEAD'});
  const headers = response.headers;
  const pageUrl = new URL(url);

  if (pageUrl.protocol === 'https:' && !headerValue(headers, 'strict-transport-security')) {
    makeFinding(findings, {
      severity: 'medium',
      category: 'Headers',
      title: 'Missing HSTS Header',
      path: url,
      explanation: 'The page response did not include Strict-Transport-Security.',
      confidence: 72,
      evidence: 'Strict-Transport-Security header not found',
      recommendation: 'Set Strict-Transport-Security on HTTPS responses after confirming the whole site supports HTTPS.',
    });
  }

  const csp = headerValue(headers, 'content-security-policy');
  if (!csp) {
    makeFinding(findings, {
      severity: 'medium',
      category: 'Headers',
      title: 'Missing CSP Header',
      path: url,
      explanation: 'The response did not include a Content-Security-Policy header.',
      confidence: 78,
      evidence: 'Content-Security-Policy header not found',
      recommendation: 'Add a restrictive Content-Security-Policy header and avoid unsafe-inline where possible.',
    });
  } else if (/unsafe-inline|unsafe-eval|\*/i.test(csp)) {
    makeFinding(findings, {
      severity: 'medium',
      category: 'Headers',
      title: 'Loose CSP Header',
      path: url,
      explanation: 'The Content Security Policy includes a broad or unsafe directive.',
      confidence: 76,
      evidence: csp.slice(0, 160),
      recommendation: 'Tighten script-src/style-src directives and avoid unsafe-inline, unsafe-eval, and broad wildcards.',
    });
  }

  if (!headerValue(headers, 'x-content-type-options')) {
    makeFinding(findings, {
      severity: 'low',
      category: 'Headers',
      title: 'Missing X-Content-Type-Options',
      path: url,
      explanation: 'The response did not include X-Content-Type-Options.',
      confidence: 70,
      evidence: 'X-Content-Type-Options header not found',
      recommendation: 'Set X-Content-Type-Options: nosniff on document and asset responses.',
    });
  }

  if (!headerValue(headers, 'referrer-policy')) {
    makeFinding(findings, {
      severity: 'low',
      category: 'Headers',
      title: 'Missing Referrer-Policy Header',
      path: url,
      explanation: 'The response did not include Referrer-Policy.',
      confidence: 70,
      evidence: 'Referrer-Policy header not found',
      recommendation: 'Set Referrer-Policy, such as strict-origin-when-cross-origin.',
    });
  }

  const frameAncestors = csp?.match(/frame-ancestors\s+([^;]+)/i)?.[1];
  if (!headerValue(headers, 'x-frame-options') && !frameAncestors) {
    makeFinding(findings, {
      severity: 'low',
      category: 'Headers',
      title: 'No Clickjacking Protection Header',
      path: url,
      explanation: 'The response did not include X-Frame-Options or a CSP frame-ancestors directive.',
      confidence: 66,
      evidence: 'X-Frame-Options and frame-ancestors not found',
      recommendation: 'Use CSP frame-ancestors or X-Frame-Options to restrict framing.',
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
  } else if (acao === '*') {
    makeFinding(findings, {
      severity: 'low',
      category: 'CORS',
      title: 'Wildcard CORS Origin',
      path: url,
      explanation: 'The response allows requests from any origin.',
      confidence: 62,
      evidence: 'Access-Control-Allow-Origin: *',
      recommendation: 'Use a specific allowlist for APIs that expose non-public data.',
    });
  }
}

async function detectExposedFiles(url: string, findings: Finding[]) {
  const origin = new URL(url).origin;

  await Promise.all(exposedFileChecks.map(async check => {
    const target = `${origin}${check.path}`;

    try {
      const response = await fetchWithTimeout(target, {method: 'GET', headers: {Range: 'bytes=0-2048'}});
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

async function detectJavascriptBundles(pageUrl: string, assetUrls: string[], findings: Finding[], settings?: {sourceMaps?: boolean}) {
  const origin = new URL(pageUrl).origin;
  const scripts = assetUrls
    .filter(url => /\.m?js(?:[?#].*)?$/i.test(url))
    .filter(url => isSameOrigin(url, origin))
    .slice(0, 10);

  await Promise.all(scripts.map(async scriptUrl => {
    try {
      const response = await fetchWithTimeout(scriptUrl);
      if (!response.ok) return;

      const text = await response.text();
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

      if (settings?.sourceMaps === false) return;

      const mapRef = text.match(/sourceMappingURL=([^\s*]+)/)?.[1];
      const mapUrl = mapRef ? resolveSourceMapUrl(scriptUrl, mapRef) : `${scriptUrl}.map`;
      if (!mapUrl || !isSameOrigin(mapUrl, origin)) return;

      const mapResponse = await fetchWithTimeout(mapUrl, {headers: {Range: 'bytes=0-2048'}});
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

async function detectCookieIssues(url: string, findings: Finding[]) {
  if (typeof chrome === 'undefined' || !chrome.cookies?.getAll) return;

  const pageUrl = new URL(url);
  const cookies = await chrome.cookies.getAll({url});
  const sensitiveCookieName = /(session|auth|token|jwt|sid|csrf|xsrf|refresh)/i;

  for (const cookie of cookies.slice(0, 40)) {
    const isSensitive = sensitiveCookieName.test(cookie.name);

    if (pageUrl.protocol === 'https:' && !cookie.secure) {
      makeFinding(findings, {
        severity: isSensitive ? 'high' : 'medium',
        category: 'Cookies',
        title: 'Cookie Missing Secure Flag',
        path: `${cookie.domain}${cookie.path}`,
        explanation: 'A cookie available on an HTTPS site is not marked Secure.',
        confidence: 82,
        evidence: cookie.name,
        recommendation: 'Set the Secure flag on cookies used by HTTPS pages.',
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

    if (cookie.sameSite === 'no_restriction' && !cookie.secure) {
      makeFinding(findings, {
        severity: 'medium',
        category: 'Cookies',
        title: 'SameSite=None Cookie Without Secure',
        path: `${cookie.domain}${cookie.path}`,
        explanation: 'A SameSite=None cookie should also be marked Secure.',
        confidence: 80,
        evidence: cookie.name,
        recommendation: 'Set Secure on SameSite=None cookies or use Lax/Strict when cross-site use is not needed.',
      });
    }
  }
}

async function runNetworkScan(url: string, assetUrls: string[] = [], settings?: {sourceMaps?: boolean}) {
  const findings: Finding[] = [];

  try {
    await detectResponseHeaders(url, findings);
  } catch {
    // Header checks are best-effort.
  }

  try {
    await detectExposedFiles(url, findings);
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

  return findings;
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
    const settings = typeof request.settings === 'object' && request.settings ? request.settings as {sourceMaps?: boolean} : undefined;
    void runNetworkScan(request.url, assetUrls, settings).then(findings => {
      sendResponse({findings});
    });
    return true;
  }
});
