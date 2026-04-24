import { useUser } from "@clerk/clerk-expo";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SectionList,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { TransactionForm } from "../../components/transaction/transaction-form";
import { TransactionItem } from "../../components/transaction/transaction-item";
import { FAB } from "../../components/ui/fab";
import { useActiveBudget } from "../../context/active-budget";
import { useCategories } from "../../hooks/use-categories";
import {
  type TransactionWithCategory,
  useTransactions,
} from "../../hooks/use-transactions";
import { formatCurrency, formatGroupDate } from "../../lib/utils";

const USafeAreaView = withUniwind(SafeAreaView);

type Filter = "ALL" | "INCOME" | "EXPENSES" | string;

export default function ActivityScreen() {
  const { user } = useUser();
  const { activeBudgetId } = useActiveBudget();
  const { categories } = useCategories(user?.id);
  const {
    transactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(activeBudgetId);

  const [filter, setFilter] = useState<Filter>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] =
    useState<TransactionWithCategory | null>(null);
  const [actionTransaction, setActionTransaction] =
    useState<TransactionWithCategory | null>(null);

  const filtered = useMemo(() => {
    if (filter === "ALL") return transactions;
    if (filter === "INCOME") return transactions.filter((t) => t.amount > 0);
    if (filter === "EXPENSES") return transactions.filter((t) => t.amount < 0);
    return transactions.filter((t) => t.categoryId === filter);
  }, [transactions, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, TransactionWithCategory[]>();
    for (const t of filtered) {
      const key = new Date(t.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).map(([key, data]) => ({
      title: formatGroupDate(new Date(key)),
      data,
    }));
  }, [filtered]);

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const filterChips: { key: Filter; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "INCOME", label: "Income" },
    { key: "EXPENSES", label: "Expenses" },
    ...categories.map((c) => ({ key: c.id, label: c.name })),
  ];

  const handleDelete = () => {
    if (!actionTransaction) return;
    Alert.alert("Delete Transaction", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTransaction(actionTransaction.id);
          setActionTransaction(null);
        },
      },
    ]);
  };

  return (
    <USafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-xs font-bold text-primary tracking-widest">
          ACTIVITY
        </Text>
        <Text className="text-3xl font-black text-foreground">
          TRANSACTIONS
        </Text>
        <Text className="text-sm text-muted-foreground">
          Track every dollar in and out
        </Text>
      </View>

      {/* Summary cards */}
      <View className="flex-row gap-3 px-4 mt-2 mb-3">
        <View className="flex-1 bg-card rounded-2xl p-3.5">
          <Text className="text-xs font-bold text-muted-foreground tracking-widest mb-1">
            INCOME
          </Text>
          <Text className="text-success text-lg font-bold">
            +{formatCurrency(totalIncome)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-2xl p-3.5">
          <Text className="text-xs font-bold text-muted-foreground tracking-widest mb-1">
            EXPENSES
          </Text>
          <Text className="text-destructive-foreground text-lg font-bold">
            -{formatCurrency(totalExpenses)}
          </Text>
        </View>
      </View>

      {/* Filter chips — horizontal FlatList */}
      <View>
        <FlatList
          horizontal
          data={filterChips}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = filter === item.key;
            return (
              <Pressable
                className={
                  isActive
                    ? "px-4 py-2 rounded-full bg-primary mx-1"
                    : "px-4 py-2 rounded-full bg-card border border-border mx-1"
                }
                onPress={() => setFilter(item.key)}
              >
                <Text
                  className={
                    isActive
                      ? "text-primary-foreground text-xs font-bold"
                      : "text-foreground text-xs font-medium"
                  }
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 4 }}
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        />
      </View>

      {/* Transaction list grouped by date */}
      <SectionList
        sections={grouped}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View className="px-4 py-2">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} onPress={setActionTransaction} />
        )}
        contentContainerStyle={{ paddingBottom: 112 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center pt-20">
            <Text className="text-4xl mb-3">📋</Text>
            <Text className="text-foreground font-bold text-lg">
              No transactions
            </Text>
            <Text className="text-muted-foreground text-sm mt-1">
              Tap + to add one
            </Text>
          </View>
        }
      />

      <FAB
        onPress={() => {
          setEditTransaction(null);
          setShowForm(true);
        }}
        disabled={!activeBudgetId}
      />

      {/* Edit / Delete action sheet */}
      <Modal
        visible={!!actionTransaction}
        transparent
        animationType="fade"
        onRequestClose={() => setActionTransaction(null)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setActionTransaction(null)}
        >
          <View className="bg-card rounded-t-3xl pt-4 pb-safe-offset-4 px-4">
            <View className="w-10 h-1 rounded-full bg-border self-center mb-4" />
            {actionTransaction && (
              <>
                <Text className="text-base font-bold text-foreground mb-1 px-2">
                  {actionTransaction.title}
                </Text>
                <Text className="text-sm text-muted-foreground mb-4 px-2">
                  {actionTransaction.categoryName} ·{" "}
                  {actionTransaction.amount < 0 ? "-" : "+"}
                  {formatCurrency(actionTransaction.amount)}
                </Text>
              </>
            )}
            <Pressable
              className="py-3.5 rounded-xl bg-secondary mb-2 items-center active:opacity-80"
              onPress={() => {
                setEditTransaction(actionTransaction);
                setActionTransaction(null);
                setShowForm(true);
              }}
            >
              <Text className="text-secondary-foreground font-semibold">
                Edit
              </Text>
            </Pressable>
            <Pressable
              className="py-3.5 rounded-xl bg-destructive mb-4 items-center active:opacity-80"
              onPress={handleDelete}
            >
              <Text className="text-destructive-foreground font-semibold">
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <TransactionForm
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          setEditTransaction(null);
        }}
        categories={categories}
        editTransaction={editTransaction}
        onSubmit={(data) => {
          if (!user?.id) return;
          if (editTransaction) {
            updateTransaction(editTransaction.id, {
              title: data.title,
              amount: data.amount,
              categoryId: data.categoryId,
              note: data.note || null,
              date: data.date,
            });
          } else {
            createTransaction({ ...data, userId: user.id });
          }
        }}
      />
    </USafeAreaView>
  );
}
