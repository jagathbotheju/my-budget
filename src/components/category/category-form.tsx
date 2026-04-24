import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { type Category } from '../../db/schema';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const PRESET_ICONS = ['🍔', '🚗', '🎬', '💊', '🛍️', '💡', '💰', '📦', '✈️', '🏠', '🎓', '💳', '🎮', '🐾', '💼', '🌿'];
const PRESET_COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b', '#16a34a', '#6b7280', '#ef4444', '#06b6d4', '#84cc16', '#a855f7'];

type CategoryFormProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; icon: string; color: string; budgetLimit?: number }) => void;
  editCategory?: Category | null;
};

export function CategoryForm({ visible, onClose, onSubmit, editCategory }: CategoryFormProps) {
  const [name, setName] = useState(editCategory?.name ?? '');
  const [icon, setIcon] = useState(editCategory?.icon ?? '📦');
  const [color, setColor] = useState(editCategory?.color ?? '#6b7280');
  const [limitStr, setLimitStr] = useState(
    editCategory?.budgetLimit ? String(editCategory.budgetLimit) : '',
  );

  const reset = () => {
    setName('');
    setIcon('📦');
    setColor('#6b7280');
    setLimitStr('');
  };

  const handleSubmit = () => {
    if (!name.trim()) { Alert.alert('Error', 'Category name is required'); return; }
    const budgetLimit = limitStr ? parseFloat(limitStr) : undefined;
    onSubmit({ name: name.trim(), icon, color, budgetLimit });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={handleClose}>
        <View className="bg-card rounded-t-3xl px-6 pt-4 pb-safe-offset-6">
          <View className="w-10 h-1 rounded-full bg-border self-center mb-5" />
          <Text className="text-xl font-bold text-foreground mb-5">
            {editCategory ? 'Edit Category' : 'New Category'}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Food & Drinks"
              containerClassName="mb-4"
            />

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Icon</Text>
              <View className="flex-row flex-wrap gap-2">
                {PRESET_ICONS.map((ic) => (
                  <Pressable
                    key={ic}
                    className={ic === icon ? 'w-11 h-11 rounded-xl bg-primary items-center justify-center' : 'w-11 h-11 rounded-xl bg-muted items-center justify-center'}
                    onPress={() => setIcon(ic)}
                  >
                    <Text className="text-2xl">{ic}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Color</Text>
              <View className="flex-row flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: c }}
                    onPress={() => setColor(c)}
                  >
                    {c === color && <Text className="text-white font-bold text-xs">✓</Text>}
                  </Pressable>
                ))}
              </View>
            </View>

            <Input
              label="Budget Limit (optional)"
              value={limitStr}
              onChangeText={setLimitStr}
              placeholder="0.00"
              keyboardType="decimal-pad"
              containerClassName="mb-6"
            />

            <Button label={editCategory ? 'Save Changes' : 'Add Category'} onPress={handleSubmit} />
            <Button label="Cancel" variant="ghost" onPress={handleClose} className="mt-2 mb-2" />
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}
