interface ProgressTrackerProps {
  totalDays: number;
  completedDays: number[];
  currentDay: number;
}

export function ProgressTracker({
  totalDays,
  completedDays,
  currentDay,
}: ProgressTrackerProps) {
  const completedCount = completedDays.length;
  const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-navy">
          {completedCount} / {totalDays} days completed
        </p>
        <p className="text-sm font-semibold text-gold">{percentage}%</p>
      </div>

      <div className="h-3 w-full rounded-full bg-muted">
        <div
          className="h-3 rounded-full bg-gold transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">
        {Array.from({ length: totalDays }, (_, i) => {
          const dayNum = i + 1;
          const isCompleted = completedDays.includes(dayNum);
          const isCurrent = dayNum === currentDay;

          return (
            <div
              key={dayNum}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                isCompleted
                  ? 'bg-gold text-navy'
                  : isCurrent
                    ? 'ring-2 ring-gold bg-gold/10 text-navy'
                    : 'bg-muted text-muted-foreground'
              }`}
              title={`Day ${dayNum}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}
