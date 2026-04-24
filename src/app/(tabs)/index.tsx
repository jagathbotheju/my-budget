import { useUser } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { BudgetSelector } from "../../components/budget/budget-selector";
import { SpendingChart } from "../../components/charts/spending-chart";
import { TransactionForm } from "../../components/transaction/transaction-form";
import { FAB } from "../../components/ui/fab";
import { useActiveBudget } from "../../context/active-budget";
import { useBudgets } from "../../hooks/use-budgets";
import { useCategories } from "../../hooks/use-categories";
import { useTransactions } from "../../hooks/use-transactions";
import { formatCurrency, formatMonthYear, getInitials } from "../../lib/utils";

const USafeAreaView = withUniwind(SafeAreaView);

type Period = "W" | "M" | "Y";

export default function HomeScreen() {
  const { user } = useUser();
  const { activeBudgetId, setActiveBudgetId, isLoaded } = useActiveBudget();
  const { budgets } = useBudgets(user?.id);
  const { categories, seedDefaults } = useCategories(user?.id);
  const { transactions, createTransaction } = useTransactions(activeBudgetId);

  const [period, setPeriod] = useState<Period>("W");
  const [showBudgetSelector, setShowBudgetSelector] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  // Auto-select first budget if none selected
  useEffect(() => {
    if (isLoaded && !activeBudgetId && budgets.length > 0) {
      setActiveBudgetId(budgets[0].id);
    }
  }, [isLoaded, activeBudgetId, budgets, setActiveBudgetId]);

  // Seed default categories on first load
  useEffect(() => {
    if (user?.id) seedDefaults();
  }, [user?.id, seedDefaults]);

  const activeBudget = budgets.find((b) => b.id === activeBudgetId);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = (activeBudget?.amount ?? 0) - totalExpenses + totalIncome;
  const saved = totalIncome - totalExpenses;

  const initials = getInitials(user?.fullName ?? user?.username ?? "U");

  return (
    <USafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <Pressable
            className="flex-row items-center gap-2 active:opacity-70"
            onPress={() => budgets.length > 0 && setShowBudgetSelector(true)}
          >
            <View className="py-1 px-2 border border-primary rounded-2xl flex-row items-center gap-1">
              <Text className="text-lg font-bold text-muted-foreground tracking-widest">
                {activeBudget?.name ?? "MY BUDGET"}
              </Text>
              {budgets.length > 1 && (
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              )}
            </View>
          </Pressable>
          <View className="flex-row items-center gap-2">
            <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
              <Text className="text-primary-foreground text-xs font-bold">
                {initials}
              </Text>
            </View>
          </View>
        </View>

        {/* Greeting + Title */}
        <View className="px-5 mt-2 mb-4">
          <Text className="text-sm text-muted-foreground">Good morning</Text>
          <Text className="text-4xl font-black text-foreground leading-tight mt-1">
            YOUR TOTAL{"\n"}BALANCE
          </Text>
        </View>

        {/* Balance Card */}
        <View className="mx-4 rounded-3xl bg-accent p-5 mb-6">
          <View className="flex-row justify-between items-start mb-3">
            <Text className="text-xs font-bold text-accent-foreground/60 tracking-widest">
              AVAILABLE FUNDS
            </Text>
            <Text className="text-xs text-accent-foreground/60">
              {formatMonthYear(new Date())}
            </Text>
          </View>

          <Text className="text-4xl font-black text-accent-foreground mb-4">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>

          <View className="flex-row gap-4 border-t border-accent-foreground/20 pt-3">
            <View className="flex-1">
              <Text className="text-xs text-accent-foreground/50 font-bold tracking-widest">
                INCOME
              </Text>
              <Text className="text-success font-bold text-sm mt-0.5">
                +{formatCurrency(totalIncome)}
              </Text>
            </View>
            <View className="w-px bg-accent-foreground/20" />
            <View className="flex-1">
              <Text className="text-xs text-accent-foreground/50 font-bold tracking-widest">
                EXPENSES
              </Text>
              <Text className="text-destructive-foreground font-bold text-sm mt-0.5">
                -{formatCurrency(totalExpenses)}
              </Text>
            </View>
            <View className="w-px bg-accent-foreground/20" />
            <View className="flex-1">
              <Text className="text-xs text-accent-foreground/50 font-bold tracking-widest">
                SAVED
              </Text>
              <Text
                className={
                  saved >= 0
                    ? "text-success font-bold text-sm mt-0.5"
                    : "text-destructive-foreground font-bold text-sm mt-0.5"
                }
              >
                {saved >= 0 ? "+" : ""}
                {formatCurrency(saved)}
              </Text>
            </View>
          </View>
        </View>

        {/* Spending Chart */}
        <View className="mx-4 bg-card rounded-3xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-bold text-foreground tracking-widest">
              SPENDING
            </Text>
            <View className="flex-row bg-muted rounded-lg overflow-hidden">
              {(["W", "M", "Y"] as Period[]).map((p) => (
                <Pressable
                  key={p}
                  className={
                    period === p ? "px-3 py-1.5 bg-primary" : "px-3 py-1.5"
                  }
                  onPress={() => setPeriod(p)}
                >
                  <Text
                    className={
                      period === p
                        ? "text-primary-foreground text-xs font-bold"
                        : "text-muted-foreground text-xs font-bold"
                    }
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          {transactions.length > 0 ? (
            <SpendingChart transactions={transactions} period={period} />
          ) : (
            <View className="h-32 items-center justify-center">
              <Text className="text-muted-foreground text-sm">
                No spending data yet
              </Text>
            </View>
          )}
        </View>

        {/* Empty state */}
        {budgets.length === 0 && (
          <View className="mx-4 bg-card rounded-3xl p-6 items-center">
            <Text className="text-4xl mb-3">💸</Text>
            <Text className="text-foreground font-bold text-lg mb-1">
              No budget yet
            </Text>
            <Text className="text-muted-foreground text-sm text-center">
              Go to Settings to create your first budget
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        onPress={() => setShowTransactionForm(true)}
        disabled={budgets.length === 0}
      />

      <BudgetSelector
        visible={showBudgetSelector}
        budgets={budgets}
        activeBudgetId={activeBudgetId}
        onSelect={setActiveBudgetId}
        onClose={() => setShowBudgetSelector(false)}
      />

      <TransactionForm
        visible={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        categories={categories}
        onSubmit={(data) => {
          if (!user?.id) return;
          createTransaction({ ...data, userId: user.id });
        }}
      />
    </USafeAreaView>
  );
}
