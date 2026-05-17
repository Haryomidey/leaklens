import {useMemo} from 'react';
import {Copy, Download, Share2, ShieldCheck} from 'lucide-react';
import {PopupHeader} from '../components/layout/PopupHeader';
import {Card} from '../components/ui/Card';
import {Button} from '../components/ui/Button';
import {useScan} from '../popup/ScanContext';

export default function Report() {
  const {result} = useScan();
  const reportDate = new Intl.DateTimeFormat(undefined, {dateStyle: 'medium'}).format(new Date(result.scannedAt));
  const riskLevel = result.score >= 85 ? 'Critical' : result.score >= 60 ? 'High' : result.score >= 30 ? 'Medium' : 'Low';
  const severityBreakdown = useMemo(() => {
    const items = [
      {key: 'critical', label: 'Critical', color: 'bg-red-500'},
      {key: 'high', label: 'High', color: 'bg-orange-500'},
      {key: 'medium', label: 'Medium', color: 'bg-yellow-500'},
      {key: 'low', label: 'Low', color: 'bg-blue-500'},
    ] as const;

    return items.map(item => ({
      ...item,
      count: result.findings.filter(finding => finding.severity === item.key).length,
    }));
  }, [result.findings]);
  const actions = result.findings.length
    ? Array.from(new Set(result.findings.map(finding => finding.recommendation))).slice(0, 5)
    : ['Run a scan on the active tab to generate remediation steps.'];
  const reportText = [
    'LeakLens page report',
    `Target: ${result.hostname}`,
    `URL: ${result.url || 'Unavailable'}`,
    `Scanned: ${reportDate}`,
    `Status: ${riskLevel}`,
    `Issues: ${result.findings.length}`,
    '',
    ...result.findings.map(finding => (
      `${finding.severity} - ${finding.title}\n${finding.path}\nEvidence: ${finding.evidence}\nSuggested fix: ${finding.recommendation}`
    )),
  ].join('\n\n');

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText);
  };

  const downloadReport = () => {
    const blob = new Blob([reportText], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `leaklens-${result.hostname || 'report'}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const shareReport = async () => {
    if ('share' in navigator) {
      await navigator.share({
        title: 'LeakLens page report',
        text: reportText,
      });
      return;
    }

    await copyReport();
  };

  return (
    <div className="flex min-h-full flex-col">
      <PopupHeader />

      <div className="space-y-6 px-4 py-6">
        <div className="text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold">Page report</h2>
          <p className="text-sm text-zinc-500">{result.hostname} - {reportDate}</p>
        </div>

        <Card className="border-zinc-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-r border-zinc-100">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Status</span>
              <span className="text-2xl font-semibold text-zinc-900">{riskLevel}</span>
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-zinc-500">Issues</span>
              <span className="text-2xl font-semibold text-zinc-900">{String(result.findings.length).padStart(2, '0')}</span>
            </div>
          </div>
        </Card>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">Breakdown</h3>
          <div className="space-y-2">
            {severityBreakdown.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-12 text-[10px] font-bold">{item.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full ${item.color}`}
                    style={{width: `${result.findings.length ? (item.count / result.findings.length) * 100 : 0}%`}}
                  />
                </div>
                <span className="w-4 text-right text-[10px] font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">Next steps</h3>
          <ul className="space-y-2">
            {actions.map((action, index) => (
              <li key={action} className="flex items-start gap-2 text-sm text-zinc-600">
                <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold">{index + 1}</div>
                {action}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-zinc-100 bg-white p-4 text-xs">
        <Button variant="outline" className="h-10 gap-2" onClick={() => void copyReport()}>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <Button variant="outline" className="h-10 gap-2" onClick={downloadReport}>
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
        <Button variant="primary" className="col-span-2 h-10 gap-2" onClick={() => void shareReport()}>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
      </div>
    </div>
  );
}
