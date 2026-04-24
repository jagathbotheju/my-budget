import { TextInput, type TextInputProps, View, Text } from 'react-native';
import { cn } from '../../lib/cn';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
};

export function Input({ label, error, containerClassName, className, ...props }: InputProps) {
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      )}
      <TextInput
        className={cn(
          'bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground',
          error && 'border-destructive-foreground',
          className,
        )}
        placeholderTextColorClassName="accent-muted-foreground"
        selectionColorClassName="accent-primary"
        cursorColorClassName="accent-primary"
        {...props}
      />
      {error && <Text className="text-sm text-destructive-foreground">{error}</Text>}
    </View>
  );
}
