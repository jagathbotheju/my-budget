import { useUser } from "@clerk/clerk-expo";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { ProgressBar } from "../../components/ui/progress-bar";
import { useActiveBudget } from "../../context/active-budget";
import { useBudgets } from "../../hooks/use-budgets";
import { useCategories } from "../../hooks/use-categories";
import { useTransactions } from "../../hooks/use-transactions";
import {
  endOfMonth,
  endOfYear,
  formatCurrency,
  startOfMonth,
  startOfYear,
} from "../../lib/utils";

const USafeAreaView = withUniwind(SafeAreaView);

type Period = "MONTHLY" | "YEARLY";

export default function BudgetScreen() {
  const { user } = useUser();
  const { activeBudgetId } = useActiveBudget();
  const { budgets } = useBudgets(user?.id);
  const { categories } = useCategories(user?.id);
  const { getByDateRange } = useTransactions(activeBudgetId);

  const [period, setPeriod] = useState<Period>("MONTHLY");

  const activeBudget = budgets.find((b) => b.id === activeBudgetId);

  const periodTransactions = useMemo(() => {
    const now = new Date();
    const from = period === "MONTHLY" ? startOfMonth(now) : startOfYear(now);
    const to = period === "MONTHLY" ? endOfMonth(now) : endOfYear(now);
    return getByDateRange(from, to);
  }, [period, getByDateRange]);

  const totalSpent = useMemo(
    () =>
      periodTransactions
        .filter((t) => t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    [periodTransactions],
  );
  const totalIncome = useMemo(
    () =>
      periodTransactions
        .filter((t) => t.amount > 0)
        .reduce((s, t) => s + t.amount, 0),
    [periodTransactions],
  );

  const budgetAmount = activeBudget?.amount ?? 0;
  const remaining = budgetAmount - totalSpent + totalIncome;
  const pctUsed =
    budgetAmount > 0 ? Math.round((totalSpent / budgetAmount) * 100) : 0;

  const categorySpend = useMemo(() => {
    return categories
      .map((cat) => {
        const spent = periodTransactions
          .filter((t) => t.categoryId === cat.id && t.amount < 0)
          .reduce((s, t) => s + Math.abs(t.amount), 0);
        const limit = cat.budgetLimit ?? 0;
        const pct =
          limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
        return { cat, spent, limit, pct };
      })
      .filter((c) => c.spent > 0);
  }, [categories, periodTransactions]);

  if (!activeBudget) {
    return (
      <USafeAreaView
        className="flex-1 bg-background items-center justify-center"
        edges={["top"]}
      >
        <Text className="text-4xl mb-3">📊</Text>
        <Text className="text-foreground font-bold text-lg">
          No budget selected
        </Text>
        <Text className="text-muted-foreground text-sm mt-1">
          Create a budget in Settings
        </Text>
      </USafeAreaView>
    );
  }

  return (
    <USafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
        ListHeaderComponent={
          <>
            {/* Header */}
            <View className="px-5 pt-4 pb-2">
              <Text className="text-xs font-bold text-muted-foreground tracking-widest">
                YOUR
              </Text>
              <Text className="text-3xl font-black text-foreground leading-tight">
                {activeBudget.name.toUpperCase()}
              </Text>
              <Text className="text-3xl font-black text-muted-foreground leading-tight">
                BUDGET
              </Text>
            </View>

            {/* Period toggle */}
            <View className="flex-row mx-4 mt-3 bg-muted rounded-xl p-1 mb-4">
              {(["MONTHLY", "YEARLY"] as Period[]).map((p) => (
                <Pressable
                  key={p}
                  className={
                    period === p
                      ? "flex-1 py-2.5 rounded-lg bg-primary items-center"
                      : "flex-1 py-2.5 rounded-lg items-center"
                  }
                  onPress={() => setPeriod(p)}
                >
                  <Text
                    className={
                      period === p
                        ? "text-primary-foreground text-xs font-bold tracking-widest"
                        : "text-muted-foreground text-xs font-bold tracking-widest"
                    }
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Summary card */}
            <View className="mx-4 bg-card rounded-3xl p-5 mb-4">
              <View className="items-center mb-4">
                <Text className="text-7xl font-black text-foreground">
                  {pctUsed}
                  <Text className="text-4xl font-black text-muted-foreground">
                    %
                  </Text>
                </Text>
                <Text className="text-xs font-bold text-muted-foreground tracking-widest mt-1">
                  USED THIS {period === "MONTHLY" ? "MONTH" : "YEAR"}
                </Text>
              </View>

              <View className="mb-1 flex-row justify-between">
                <Text className="text-xs text-muted-foreground">${0}</Text>
                <Text className="text-xs text-muted-foreground">
                  {formatCurrency(budgetAmount)}
                </Text>
              </View>
              <ProgressBar
                value={pctUsed}
                fillClassName={
                  pctUsed >= 90
                    ? "bg-destructive-foreground"
                    : pctUsed >= 70
                      ? "bg-primary"
                      : "bg-success"
                }
              />

              <View className="flex-row justify-between mt-4 pt-4 border-t border-border">
                <View className="items-center flex-1">
                  <Text className="text-xs font-bold text-muted-foreground tracking-widest">
                    SPENT
                  </Text>
                  <Text className="text-destructive-foreground font-bold text-base mt-1">
                    {formatCurrency(totalSpent)}
                  </Text>
                </View>
                <View className="w-px bg-border" />
                <View className="items-center flex-1">
                  <Text className="text-xs font-bold text-muted-foreground tracking-widest">
                    BUDGET
                  </Text>
                  <Text className="text-foreground font-bold text-base mt-1">
                    {formatCurrency(budgetAmount)}
                  </Text>
                </View>
                <View className="w-px bg-border" />
                <View className="items-center flex-1">
                  <Text className="text-xs font-bold text-muted-foreground tracking-widest">
                    LEFT
                  </Text>
                  <Text
                    className={
                      remaining >= 0
                        ? "text-success font-bold text-base mt-1"
                        : "text-destructive-foreground font-bold text-base mt-1"
                    }
                  >
                    {formatCurrency(remaining)}
                  </Text>
                </View>
              </View>
            </View>

            {categorySpend.length > 0 && (
              <Text className="text-sm font-bold text-foreground tracking-widest px-5 mb-2">
                CATEGORIES
              </Text>
            )}
          </>
        }
        data={categorySpend}
        keyExtractor={(item) => item.cat.id}
        renderItem={({ item }) => (
          <View className="mx-4 mb-2 bg-card rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2 flex-1">
                <Text className="text-xl">{item.cat.icon ?? "📦"}</Text>
                <Text className="text-sm font-bold text-foreground flex-1">
                  {item.cat.name.toUpperCase()}
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground">
                {formatCurrency(item.spent)}
                {item.limit > 0 && ` / ${formatCurrency(item.limit)}`}
              </Text>
            </View>
            {item.limit > 0 && (
              <>
                <ProgressBar
                  value={item.pct}
                  fillClassName={
                    item.pct >= 90 ? "bg-destructive-foreground" : "bg-primary"
                  }
                />
                <Text className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(item.limit - item.spent)} remaining
                </Text>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={
          categorySpend.length === 0 ? (
            <View className="mx-4 bg-card rounded-2xl p-6 items-center">
              <Text className="text-muted-foreground text-sm">
                No category spending this{" "}
                {period === "MONTHLY" ? "month" : "year"}
              </Text>
            </View>
          ) : null
        }
      />
    </USafeAreaView>
  );
}
