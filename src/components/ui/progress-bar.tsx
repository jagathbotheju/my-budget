import { View } from 'react-native';
import { cn } from '../../lib/cn';

type ProgressBarProps = {
  value: number; // 0–100
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
};

export function ProgressBar({
  value,
  className,
  trackClassName,
  fillClassName,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  return (
    <View className={cn('h-2 rounded-full bg-muted overflow-hidden', trackClassName, className)}>
      <View
        className={cn('h-full rounded-full bg-primary', fillClassName)}
        style={{ width: `${clampedValue}%` }}
      />
    </View>
  );
}
