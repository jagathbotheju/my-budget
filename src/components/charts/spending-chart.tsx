import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { type TransactionWithCategory } from '../../hooks/use-transactions';
import {
  endOfMonth,
  endOfYear,
  getDayLabel,
  getMonthLabel,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from '../../lib/utils';

type Period = 'W' | 'M' | 'Y';

type BarData = { label: string; value: number };

type SpendingChartProps = {
  transactions: TransactionWithCategory[];
  period: Period;
};

function buildWeekData(txs: TransactionWithCategory[]): BarData[] {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const days: BarData[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const label = getDayLabel(d);
    const total = txs
      .filter((t) => {
        const td = new Date(t.date);
        return td.toDateString() === d.toDateString() && t.amount < 0;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    days.push({ label, value: total });
  }
  return days;
}

function buildMonthData(txs: TransactionWithCategory[]): BarData[] {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const weeks: BarData[] = [];

  let current = new Date(start);
  let weekNum = 1;
  while (current <= end) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const label = `W${weekNum}`;
    const total = txs
      .filter((t) => {
        const td = new Date(t.date);
        return td >= current && td <= weekEnd && t.amount < 0;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    weeks.push({ label, value: total });
    current.setDate(current.getDate() + 7);
    weekNum++;
  }
  return weeks;
}

function buildYearData(txs: TransactionWithCategory[]): BarData[] {
  const today = new Date();
  const months: BarData[] = [];

  for (let m = 0; m < 12; m++) {
    const start = new Date(today.getFullYear(), m, 1);
    const end = new Date(today.getFullYear(), m + 1, 0, 23, 59, 59);
    const label = getMonthLabel(start).slice(0, 3);
    const total = txs
      .filter((t) => {
        const td = new Date(t.date);
        return td >= start && td <= end && t.amount < 0;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    months.push({ label, value: total });
  }
  return months;
}

export function SpendingChart({ transactions, period }: SpendingChartProps) {
  const bars = useMemo(() => {
    if (period === 'W') return buildWeekData(transactions);
    if (period === 'M') return buildMonthData(transactions);
    return buildYearData(transactions);
  }, [transactions, period]);

  const maxValue = Math.max(...bars.map((b) => b.value), 1);
  const CHART_HEIGHT = 100;

  const today = new Date();
  const currentLabel =
    period === 'W'
      ? getDayLabel(today)
      : period === 'M'
        ? `W${Math.ceil(today.getDate() / 7)}`
        : getMonthLabel(today).slice(0, 3);

  return (
    <View className="px-4 pt-2">
      <View className="flex-row items-end gap-1" style={{ height: CHART_HEIGHT + 24 }}>
        {bars.map((bar, i) => {
          const isActive = bar.label === currentLabel;
          const barH = bar.value > 0 ? Math.max((bar.value / maxValue) * CHART_HEIGHT, 4) : 4;
          return (
            <View key={i} className="flex-1 items-center justify-end" style={{ height: CHART_HEIGHT + 24 }}>
              {bar.value > 0 && isActive && (
                <Text className="text-primary text-xs font-bold mb-1">
                  ${Math.round(bar.value)}
                </Text>
              )}
              <View
                className={isActive ? 'w-full rounded-t-lg bg-primary' : 'w-full rounded-t-md bg-muted'}
                style={{ height: barH }}
              />
              <Text className="text-muted-foreground mt-1.5 text-xs">{bar.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
