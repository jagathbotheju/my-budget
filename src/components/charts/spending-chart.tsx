import { useEffect, useMemo, useRef } from 'react';
import { Dimensions, Text, View, useColorScheme } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { type TransactionWithCategory } from '../../hooks/use-transactions';
import { getDayLabel, getMonthLabel, startOfWeek } from '../../lib/utils';

type Period = 'W' | 'M' | 'Y';

type LineData = { value: number; label: string };

type SpendingChartProps = {
  transactions: TransactionWithCategory[];
  period: Period;
};

function buildWeekData(txs: TransactionWithCategory[]): LineData[] {
  const today = new Date();
  const weekStart = startOfWeek(today);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const total = txs
      .filter((t) => new Date(t.date).toDateString() === d.toDateString() && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { value: total, label: getDayLabel(d) };
  });
}

function buildMonthData(txs: TransactionWithCategory[]): LineData[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const d = new Date(year, month, day);
    const total = txs
      .filter((t) => new Date(t.date).toDateString() === d.toDateString() && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { value: total, label: `${day}` };
  });
}

function buildYearData(txs: TransactionWithCategory[]): LineData[] {
  const today = new Date();
  return Array.from({ length: 12 }, (_, m) => {
    const start = new Date(today.getFullYear(), m, 1);
    const end = new Date(today.getFullYear(), m + 1, 0, 23, 59, 59);
    const total = txs
      .filter((t) => {
        const td = new Date(t.date);
        return td >= start && td <= end && t.amount < 0;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { value: total, label: getMonthLabel(start).slice(0, 3) };
  });
}

const SPACING = 56;
const INITIAL_SPACING = 16;
const PRIMARY = '#e36588';

function getScrollX(period: Period, containerWidth: number): number {
  const today = new Date();
  let idx = 0;
  if (period === 'W') idx = today.getDay();          // 0=Sun … 6=Sat
  else if (period === 'M') idx = today.getDate() - 1; // 0-indexed day
  else if (period === 'Y') idx = today.getMonth();    // 0-indexed month
  return Math.max(0, idx * SPACING + INITIAL_SPACING - containerWidth / 2);
}

export function SpendingChart({ transactions, period }: SpendingChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scrollRef = useRef<any>(null);

  const data = useMemo(() => {
    if (period === 'W') return buildWeekData(transactions);
    if (period === 'M') return buildMonthData(transactions);
    return buildYearData(transactions);
  }, [transactions, period]);

  const containerWidth = Dimensions.get('window').width - 64;

  const labelColor = isDark ? '#c47a93' : '#9e5069';
  const rulesColor = isDark ? '#4a1f32' : '#f0c4d4';
  const bgColor = isDark ? '#2a1020' : '#ffffff';
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  // Scroll to current day/date/month after chart animates in
  useEffect(() => {
    const x = getScrollX(period, containerWidth);
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x, animated: true });
    }, 700);
    return () => clearTimeout(timer);
  }, [period, containerWidth]);

  return (
    <View style={{ marginHorizontal: -16, overflow: 'hidden' }}>
      <LineChart
        areaChart
        curved
        isAnimated
        animationDuration={600}
        scrollRef={scrollRef}
        data={data}
        width={containerWidth}
        spacing={SPACING}
        initialSpacing={INITIAL_SPACING}
        endSpacing={16}
        color={PRIMARY}
        thickness={2.5}
        startFillColor={PRIMARY}
        endFillColor={PRIMARY}
        startOpacity={0.28}
        endOpacity={0.02}
        noOfSections={4}
        maxValue={Math.ceil((maxVal * 1.2) / 4) * 4 || 4}
        rulesColor={rulesColor}
        rulesType="dashed"
        dashWidth={4}
        dashGap={6}
        yAxisColor="transparent"
        xAxisColor={rulesColor}
        hideYAxisText
        xAxisLabelTextStyle={{ color: labelColor, fontSize: 10, fontWeight: '600' }}
        dataPointsColor={PRIMARY}
        dataPointsRadius={5}
        backgroundColor={bgColor}
        pointerConfig={{
          pointerStripColor: PRIMARY,
          pointerStripWidth: 1.5,
          pointerStripUptoDataPoint: true,
          pointerColor: PRIMARY,
          radius: 6,
          pointerLabelWidth: 72,
          pointerLabelHeight: 36,
          activatePointersOnLongPress: false,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: { value: number }[]) => (
            <View
              style={{
                backgroundColor: PRIMARY,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                ${Math.round(items[0].value).toLocaleString()}
              </Text>
            </View>
          ),
        }}
      />
    </View>
  );
}
