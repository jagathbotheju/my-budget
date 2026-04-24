import { Pressable, Text } from 'react-native';

type FABProps = { onPress: () => void; disabled?: boolean };

export function FAB({ onPress, disabled }: FABProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      className={`absolute bottom-8 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg ${disabled ? 'bg-muted' : 'bg-primary active:scale-95 active:opacity-80'}`}
    >
      <Text className={`text-3xl font-light leading-none ${disabled ? 'text-muted-foreground' : 'text-primary-foreground'}`}>+</Text>
    </Pressable>
  );
}
