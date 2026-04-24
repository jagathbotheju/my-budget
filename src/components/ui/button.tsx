import { Pressable, Text } from 'react-native';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type ButtonProps = {
  onPress: () => void;
  label: string;
  variant?: Variant;
  disabled?: boolean;
  className?: string;
};

const variantClasses: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary active:opacity-80',
    text: 'text-primary-foreground font-semibold',
  },
  secondary: {
    container: 'bg-secondary active:opacity-80',
    text: 'text-secondary-foreground font-semibold',
  },
  ghost: {
    container: 'bg-transparent border border-border active:bg-muted',
    text: 'text-foreground font-medium',
  },
  destructive: {
    container: 'bg-destructive active:opacity-80',
    text: 'text-destructive-foreground font-semibold',
  },
};

export function Button({ onPress, label, variant = 'primary', disabled, className }: ButtonProps) {
  const v = variantClasses[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'py-3.5 rounded-xl items-center justify-center',
        v.container,
        disabled && 'opacity-50',
        className,
      )}
    >
      <Text className={cn('text-base', v.text)}>{label}</Text>
    </Pressable>
  );
}
