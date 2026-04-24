import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { type Category } from "../../db/schema";
import { type TransactionWithCategory } from "../../hooks/use-transactions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type TransactionFormProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    amount: number;
    categoryId: string;
    note: string;
    date: Date;
  }) => void;
  categories: Category[];
  editTransaction?: TransactionWithCategory | null;
};

export function TransactionForm({
  visible,
  onClose,
  onSubmit,
  categories,
  editTransaction,
}: TransactionFormProps) {
  const [title, setTitle] = useState(editTransaction?.title ?? "");
  const [amountStr, setAmountStr] = useState(
    editTransaction ? String(Math.abs(editTransaction.amount)) : "",
  );
  const [isExpense, setIsExpense] = useState(
    editTransaction ? editTransaction.amount < 0 : true,
  );
  const [categoryId, setCategoryId] = useState(
    editTransaction?.categoryId ?? "",
  );
  const [note, setNote] = useState(editTransaction?.note ?? "");
  const [date, setDate] = useState(
    editTransaction ? new Date(editTransaction.date) : new Date(),
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const reset = () => {
    setTitle("");
    setAmountStr("");
    setIsExpense(true);
    setCategoryId("");
    setNote("");
    setDate(new Date());
    setShowCategoryPicker(false);
    setShowDatePicker(false);
  };

  const onDateChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate: Date,
  ) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    setDate(selectedDate);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return;
    }
    if (!categoryId) {
      Alert.alert("Error", "Select a category");
      return;
    }

    onSubmit({
      title: title.trim(),
      amount: isExpense ? -amount : amount,
      categoryId,
      note: note.trim(),
      date,
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const dateLabel = (() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();

  console.log("date", date);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <Pressable className="flex-1" onPress={handleClose} />
        <View className="bg-card rounded-t-3xl px-6 pt-4 pb-safe-offset-6">
          <View className="w-10 h-1 rounded-full bg-border self-center mb-5" />
          <Text className="text-xl font-bold text-foreground mb-5">
            {editTransaction ? "Edit Transaction" : "New Transaction"}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Type toggle */}
            <View className="flex-row bg-muted rounded-xl p-1 mb-4">
              <Pressable
                className={
                  isExpense
                    ? "flex-1 py-2.5 rounded-lg bg-primary items-center"
                    : "flex-1 py-2.5 rounded-lg items-center"
                }
                onPress={() => setIsExpense(true)}
              >
                <Text
                  className={
                    isExpense
                      ? "text-primary-foreground font-semibold text-sm"
                      : "text-muted-foreground text-sm"
                  }
                >
                  Expense
                </Text>
              </Pressable>
              <Pressable
                className={
                  !isExpense
                    ? "flex-1 py-2.5 rounded-lg bg-success items-center"
                    : "flex-1 py-2.5 rounded-lg items-center"
                }
                onPress={() => setIsExpense(false)}
              >
                <Text
                  className={
                    !isExpense
                      ? "text-white font-semibold text-sm"
                      : "text-muted-foreground text-sm"
                  }
                >
                  Income
                </Text>
              </Pressable>
            </View>

            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Grocery Store"
              containerClassName="mb-4"
            />

            <Input
              label="Amount"
              value={amountStr}
              onChangeText={setAmountStr}
              placeholder="0.00"
              keyboardType="decimal-pad"
              containerClassName="mb-4"
            />

            {/* Category picker */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-1.5">
                Category
              </Text>
              <Pressable
                className="bg-card border border-input rounded-xl px-4 py-3 flex-row items-center justify-between active:opacity-80"
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text
                  className={
                    selectedCategory
                      ? "text-foreground text-base"
                      : "text-muted-foreground text-base"
                  }
                >
                  {selectedCategory
                    ? `${selectedCategory.icon ?? ""} ${selectedCategory.name}`
                    : "Select category"}
                </Text>
                <Text className="text-muted-foreground">▾</Text>
              </Pressable>
            </View>

            {/* Date picker ANDROID*/}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-1.5">
                Date
              </Text>
              <Pressable
                className="bg-card border border-input rounded-xl px-4 py-3 flex-row items-center justify-between active:opacity-80"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-foreground text-base font-medium">
                  {dateLabel}
                </Text>
                <Text className="text-muted-foreground">📅</Text>
              </Pressable>
              {Platform.OS === "android" && showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onValueChange={onDateChange}
                  onDismiss={() => setShowDatePicker(false)}
                />
              )}
            </View>

            <Input
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              containerClassName="mb-6"
            />

            <Button
              label={editTransaction ? "Save Changes" : "Add Transaction"}
              onPress={handleSubmit}
            />
            <Button
              label="Cancel"
              variant="ghost"
              onPress={handleClose}
              className="mt-2 mb-2"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Category picker modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setShowCategoryPicker(false)}
        >
          <View className="bg-card rounded-t-3xl pt-4 pb-safe-offset-4">
            <View className="w-10 h-1 rounded-full bg-border self-center mb-4" />
            <Text className="text-lg font-bold text-foreground px-6 mb-3">
              Choose Category
            </Text>
            <ScrollView
              className="max-h-72"
              showsVerticalScrollIndicator={false}
            >
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  className="flex-row items-center px-6 py-3.5 active:bg-muted gap-3"
                  onPress={() => {
                    setCategoryId(cat.id);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text className="text-2xl">{cat.icon ?? "📦"}</Text>
                  <Text className="text-base text-foreground">{cat.name}</Text>
                  {cat.id === categoryId && (
                    <Text className="ml-auto text-primary font-bold">✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* iOS date picker modal */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1">
            <Pressable
              className="flex-1"
              onPress={() => setShowDatePicker(false)}
            />
            <View className="bg-card rounded-t-3xl pt-4 pb-safe-offset-4">
              <View className="w-10 h-1 rounded-full bg-border self-center mb-2" />
              <View className="flex-row justify-between items-center px-6 mb-2">
                <Text className="text-lg font-bold text-foreground">
                  Select Date
                </Text>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text className="text-primary font-semibold text-base">
                    Done
                  </Text>
                </Pressable>
              </View>
              <View className="self-center">
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onValueChange={onDateChange}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}
