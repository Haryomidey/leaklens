import { PopupHeader } from '../components/layout/PopupHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Copy, Share2, ShieldCheck } from 'lucide-react';

export default function Report() {
  return (
    <div className="flex flex-col min-h-full">
      <PopupHeader />
      
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-2xl mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Security Audit</h2>
          <p className="text-sm text-zinc-500">example.com • May 17, 2026</p>
        </div>

        <Card className="p-4 bg-zinc-900 text-white border-zinc-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-r border-zinc-700">
              <span className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Risk Level</span>
              <span className="text-2xl font-black text-orange-400">HIGH</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Findings</span>
              <span className="text-2xl font-black">05</span>
            </div>
          </div>
        </Card>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Severity Breakdown</h3>
          <div className="space-y-2">
            {[
              { label: 'Critical', count: 1, color: 'bg-red-500' },
              { label: 'High', count: 2, color: 'bg-orange-500' },
              { label: 'Medium', count: 1, color: 'bg-yellow-500' },
              { label: 'Low', count: 1, color: 'bg-blue-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[10px] font-bold w-12">{item.label}</span>
                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${(item.count/5)*100}%` }} />
                </div>
                <span className="text-[10px] font-bold w-4 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Next Actions</h3>
          <ul className="space-y-2">
            {[
              'Rotate Google Maps API Key',
              'Disable public source map access',
              'Review Firestore security rules',
              'Delete /admin/debug endpoint'
            ].map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                <div className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold mt-0.5">{i+1}</div>
                {action}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-auto p-4 bg-white border-t border-zinc-100 grid grid-cols-2 gap-2 text-xs">
        <Button variant="outline" className="gap-2 h-10">
          <Copy className="w-3.5 h-3.5" />
          Copy URL
        </Button>
        <Button variant="outline" className="gap-2 h-10">
          <Download className="w-3.5 h-3.5" />
          PDF Report
        </Button>
        <Button variant="primary" className="col-span-2 gap-2 h-10">
          <Share2 className="w-3.5 h-3.5" />
          Share to External Project
        </Button>
      </div>
    </div>
  );
}
