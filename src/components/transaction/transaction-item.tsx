import { Pressable, Text, View } from 'react-native';
import { type TransactionWithCategory } from '../../hooks/use-transactions';
import { formatCurrency, formatTime } from '../../lib/utils';

type TransactionItemProps = {
  transaction: TransactionWithCategory;
  onPress: (t: TransactionWithCategory) => void;
};

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isIncome = transaction.amount > 0;

  return (
    <Pressable
      className="flex-row items-center px-4 py-3.5 bg-card mx-4 mb-2 rounded-2xl active:opacity-80 gap-3"
      onPress={() => onPress(transaction)}
    >
      <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
        <Text className="text-xl">{transaction.categoryIcon ?? '📦'}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{transaction.title}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5">{transaction.categoryName}</Text>
      </View>
      <View className="items-end">
        <Text className={isIncome ? 'text-success text-sm font-bold' : 'text-destructive-foreground text-sm font-bold'}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          {formatTime(new Date(transaction.date))}
        </Text>
      </View>
    </Pressable>
  );
}
