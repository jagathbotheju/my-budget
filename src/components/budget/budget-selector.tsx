import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { type Budget } from '../../db/schema';

type BudgetSelectorProps = {
  visible: boolean;
  budgets: Budget[];
  activeBudgetId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function BudgetSelector({
  visible,
  budgets,
  activeBudgetId,
  onSelect,
  onClose,
}: BudgetSelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      backdropColorClassName="accent-black/60"
    >
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable className="bg-card rounded-t-3xl pt-4 pb-safe-offset-4">
          <View className="w-10 h-1 rounded-full bg-border self-center mb-4" />
          <Text className="text-lg font-bold text-foreground px-6 mb-3">Select Budget</Text>
          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
            {budgets.map((b) => {
              const isActive = b.id === activeBudgetId;
              return (
                <Pressable
                  key={b.id}
                  className="flex-row items-center justify-between px-6 py-4 active:bg-muted"
                  onPress={() => { onSelect(b.id); onClose(); }}
                >
                  <View>
                    <Text className="text-base font-semibold text-foreground">{b.name}</Text>
                    <Text className="text-sm text-muted-foreground">
                      ${b.amount.toLocaleString()} budget
                    </Text>
                  </View>
                  {isActive && (
                    <View className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
