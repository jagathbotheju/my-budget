import { useAuth, useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { CategoryForm } from "../../components/category/category-form";
import { Input } from "../../components/ui/input";
import { useActiveBudget } from "../../context/active-budget";
import { type Category } from "../../db/schema";
import { useBudgets } from "../../hooks/use-budgets";
import { useCategories } from "../../hooks/use-categories";
import { formatCurrency, getInitials } from "../../lib/utils";

const USafeAreaView = withUniwind(SafeAreaView);

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { activeBudgetId, setActiveBudgetId } = useActiveBudget();
  const { budgets, createBudget, deleteBudget } = useBudgets(user?.id);
  const { categories, createCategory, updateCategory, deleteCategory } =
    useCategories(user?.id);

  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [showAddBudget, setShowAddBudget] = useState(false);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const initials = getInitials(user?.fullName ?? user?.username ?? "U");
  const displayName = user?.fullName ?? user?.username ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const handleAddBudget = () => {
    const amount = parseFloat(newBudgetAmount);
    if (!newBudgetName.trim()) {
      Alert.alert("Error", "Budget name is required");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return;
    }
    const wasEmpty = budgets.length === 0;
    createBudget(newBudgetName.trim(), amount);
    setNewBudgetName("");
    setNewBudgetAmount("");
    setShowAddBudget(false);
    // Auto-select if first budget
    if (wasEmpty) {
      // Will be picked up by the context after reload
    }
  };

  const handleDeleteBudget = (id: string, name: string) => {
    Alert.alert(
      "Delete Budget",
      `Delete "${name}"? All its transactions will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteBudget(id);
            if (activeBudgetId === id) setActiveBudgetId(null);
          },
        },
      ],
    );
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert("Delete Category", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteCategory(id),
      },
    ]);
  };

  return (
    <USafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-3xl font-black text-foreground">SETTINGS</Text>
        </View>

        {/* Profile card */}
        <View className="mx-4 mt-3 bg-card rounded-3xl p-5 mb-4">
          <View className="flex-row items-center gap-4">
            <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
              <Text className="text-primary-foreground text-xl font-bold">
                {initials}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">
                {displayName}
              </Text>
              <Text className="text-sm text-muted-foreground">{email}</Text>
            </View>
          </View>
          <Pressable
            className="mt-4 py-3 rounded-xl bg-destructive items-center active:opacity-80"
            onPress={() =>
              Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign Out",
                  style: "destructive",
                  onPress: () => signOut(),
                },
              ])
            }
          >
            <Text className="text-destructive-foreground font-semibold">
              Log Out
            </Text>
          </Pressable>
        </View>

        {/* Budgets section */}
        <View className="px-5 mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-foreground tracking-widest">
            BUDGETS
          </Text>
          <Pressable
            className="w-7 h-7 rounded-full bg-primary items-center justify-center"
            onPress={() => setShowAddBudget((v) => !v)}
          >
            <Text className="text-primary-foreground font-bold leading-none">
              {showAddBudget ? "×" : "+"}
            </Text>
          </Pressable>
        </View>

        {showAddBudget && (
          <View className="mx-4 bg-card rounded-2xl p-4 mb-3 gap-3">
            <Input
              placeholder="Budget name"
              value={newBudgetName}
              onChangeText={setNewBudgetName}
            />
            <Input
              placeholder="Total amount"
              value={newBudgetAmount}
              onChangeText={setNewBudgetAmount}
              keyboardType="decimal-pad"
            />
            <Pressable
              className="py-3 rounded-xl bg-primary items-center active:opacity-80"
              onPress={handleAddBudget}
            >
              <Text className="text-primary-foreground font-semibold">
                Add Budget
              </Text>
            </Pressable>
          </View>
        )}

        {budgets.map((b) => (
          <View
            key={b.id}
            className="mx-4 mb-2 bg-card rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2 flex-1">
              {b.id === activeBudgetId && (
                <View className="w-2 h-2 rounded-full bg-primary" />
              )}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {b.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {formatCurrency(b.amount)} budget
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              {b.id !== activeBudgetId && (
                <Pressable
                  className="px-3 py-1.5 rounded-lg bg-secondary active:opacity-80"
                  onPress={() => setActiveBudgetId(b.id)}
                >
                  <Text className="text-secondary-foreground text-xs font-medium">
                    Select
                  </Text>
                </Pressable>
              )}
              <Pressable
                className="px-3 py-1.5 rounded-lg bg-destructive active:opacity-80"
                onPress={() => handleDeleteBudget(b.id, b.name)}
              >
                <Text className="text-destructive-foreground text-xs font-medium">
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        {budgets.length === 0 && (
          <View className="mx-4 bg-card rounded-2xl p-4 mb-3">
            <Text className="text-sm text-muted-foreground text-center">
              No budgets yet. Tap + to create one.
            </Text>
          </View>
        )}

        {/* Categories section */}
        <View className="px-5 mt-4 mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-foreground tracking-widest">
            CATEGORIES
          </Text>
          <Pressable
            className="w-7 h-7 rounded-full bg-primary items-center justify-center"
            onPress={() => {
              setEditCategory(null);
              setShowCategoryForm(true);
            }}
          >
            <Text className="text-primary-foreground font-bold leading-none">
              +
            </Text>
          </Pressable>
        </View>

        {categories.map((cat) => (
          <View
            key={cat.id}
            className="mx-4 mb-2 bg-card rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: cat.color ?? "#6b7280" }}
              >
                <Text className="text-lg">{cat.icon ?? "📦"}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {cat.name}
                </Text>
                {cat.budgetLimit && (
                  <Text className="text-xs text-muted-foreground">
                    Limit: {formatCurrency(cat.budgetLimit)}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                className="px-3 py-1.5 rounded-lg bg-secondary active:opacity-80"
                onPress={() => {
                  setEditCategory(cat);
                  setShowCategoryForm(true);
                }}
              >
                <Text className="text-secondary-foreground text-xs font-medium">
                  Edit
                </Text>
              </Pressable>
              <Pressable
                className="px-3 py-1.5 rounded-lg bg-destructive active:opacity-80"
                onPress={() => handleDeleteCategory(cat.id, cat.name)}
              >
                <Text className="text-destructive-foreground text-xs font-medium">
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <CategoryForm
        visible={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false);
          setEditCategory(null);
        }}
        editCategory={editCategory}
        onSubmit={(data) => {
          if (editCategory) {
            updateCategory(editCategory.id, {
              name: data.name,
              icon: data.icon,
              color: data.color,
              budgetLimit: data.budgetLimit ?? null,
            });
          } else {
            createCategory(data);
          }
        }}
      />
    </USafeAreaView>
  );
}
