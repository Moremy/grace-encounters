import * as React from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  mode?: 'bar' | 'line';
  height?: number;
  color?: string;
  title?: string;
}

export function AnalyticsChart({
  data,
  mode = 'bar',
  height = 200,
  color = 'var(--color-gold, #c9a227)',
  title,
}: AnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = 100;
  const chartHeight = height - 40; // leave room for labels

  if (mode === 'line') {
    const points = data.map((d, i) => ({
      x: (i / Math.max(data.length - 1, 1)) * chartWidth,
      y: chartHeight - (d.value / maxValue) * chartHeight,
    }));

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    return (
      <div>
        {title && (
          <p className="mb-2 text-sm font-medium text-navy">{title}</p>
        )}
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ height: chartHeight }}
          role="img"
          aria-label={title ?? 'Line chart'}
        >
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill={color}
            />
          ))}
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{data[0]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </div>
    );
  }

  // Bar chart mode
  const barWidth = chartWidth / data.length;
  const gap = barWidth * 0.2;
  const actualBarWidth = barWidth - gap;

  return (
    <div>
      {title && (
        <p className="mb-2 text-sm font-medium text-navy">{title}</p>
      )}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ height: chartHeight }}
        role="img"
        aria-label={title ?? 'Bar chart'}
      >
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (chartHeight - 10);
          return (
            <rect
              key={i}
              x={i * barWidth + gap / 2}
              y={chartHeight - barHeight}
              width={actualBarWidth}
              height={barHeight}
              fill={color}
              rx="1"
              opacity="0.85"
            />
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
