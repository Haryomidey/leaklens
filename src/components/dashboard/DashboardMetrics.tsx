import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';

export function RiskScoreCard({ score }: { score: number }) {
  let color = 'text-red-600';
  let label = 'Critical';
  let bg = 'bg-red-50';
  let border = 'border-red-100';

  if (score < 30) {
    color = 'text-emerald-600';
    label = 'Low Risk';
    bg = 'bg-emerald-50';
    border = 'border-emerald-100';
  } else if (score < 60) {
    color = 'text-blue-600';
    label = 'Medium Risk';
    bg = 'bg-blue-50';
    border = 'border-blue-100';
  } else if (score < 85) {
    color = 'text-orange-600';
    label = 'High Risk';
    bg = 'bg-orange-50';
    border = 'border-orange-100';
  }

  return (
    <Card className={cn("p-6 flex flex-col items-center justify-center text-center", bg, border)}>
      <div className="flex flex-col items-center">
        <span className={cn("text-5xl font-extrabold tracking-tighter mb-1", color)}>
          {score}
        </span>
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
          Security Score
        </span>
      </div>
      <div className={cn("mt-4 px-4 py-1.5 rounded-full border bg-white/50 text-xs font-bold uppercase tracking-widest", color, border)}>
        {label}
      </div>
    </Card>
  );
}

export function StatCard({ label, value, onClick }: { label: string; value: string | number; onClick?: () => void }) {
  const isZero = value === 0;

  return (
    <Card 
      className={cn(
        "p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-zinc-300",
        isZero ? "opacity-50 grayscale" : ""
      )}
      onClick={onClick}
    >
      <span className="text-xl font-bold tracking-tight mb-0.5">{value}</span>
      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">{label}</span>
    </Card>
  );
}
