import {cn} from '../../lib/utils';
import {Card} from '../ui/Card';

export function RiskScoreCard({score}: {score: number}) {
  let color = 'text-red-600';
  let label = 'Needs attention';
  let bar = 'bg-red-500';

  if (score < 30) {
    color = 'text-emerald-600';
    label = 'Looks quiet';
    bar = 'bg-emerald-500';
  } else if (score < 60) {
    color = 'text-blue-600';
    label = 'Worth a look';
    bar = 'bg-blue-500';
  } else if (score < 85) {
    color = 'text-orange-600';
    label = 'Review soon';
    bar = 'bg-orange-500';
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Current page</p>
          <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
        </div>
        <span className={cn('text-3xl font-semibold tabular-nums', color)}>{score}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className={cn('h-full rounded-full', bar)} style={{width: `${score}%`}} />
      </div>
    </Card>
  );
}

export function StatCard({label, value, onClick}: {label: string; value: string | number; onClick?: () => void}) {
  const isZero = value === 0;

  return (
    <Card
      className={cn(
        'flex cursor-pointer flex-col justify-center p-3 hover:border-zinc-300',
        isZero ? 'text-zinc-400' : '',
      )}
      onClick={onClick}
    >
      <span className="mb-1 text-xl font-semibold leading-none tabular-nums">{value}</span>
      <span className="text-xs font-medium leading-none text-zinc-500">{label}</span>
    </Card>
  );
}
