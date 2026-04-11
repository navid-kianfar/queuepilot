import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useThemeStore } from '@/hooks/use-theme';

interface ChartWrapperProps {
  option: EChartsOption;
  height?: number | string;
  className?: string;
}

export function ChartWrapper({ option, height = 280, className }: ChartWrapperProps) {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const themedOption: EChartsOption = {
    ...option,
    backgroundColor: 'transparent',
    textStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: 11,
    },
    grid: { left: 50, right: 20, top: 30, bottom: 30, ...(option.grid as any) },
  };

  return (
    <div className={className}>
      <ReactECharts
        option={themedOption}
        style={{ height }}
        opts={{ renderer: 'canvas' }}
        theme={isDark ? 'dark' : undefined}
      />
    </div>
  );
}
