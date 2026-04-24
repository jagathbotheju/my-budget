import { eq } from 'drizzle-orm';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../db';
import { type Category, categories } from '../db/schema';
import { dbEvents } from '../lib/events';
import { generateId } from '../lib/utils';

const DEFAULT_CATEGORIES = [
  { name: 'Food & Drinks', icon: '🍔', color: '#f97316' },
  { name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { name: 'Health', icon: '💊', color: '#10b981' },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { name: 'Bills', icon: '💡', color: '#f59e0b' },
  { name: 'Income', icon: '💰', color: '#16a34a' },
  { name: 'Other', icon: '📦', color: '#6b7280' },
];

export function useCategories(userId: string | null | undefined) {
  const [data, setData] = useState<Category[]>([]);

  const load = useCallback(() => {
    if (!userId) { setData([]); return; }
    try {
      const result = db.select().from(categories).where(eq(categories.userId, userId)).all();
      setData(result);
    } catch (e) {
      console.error('useCategories load error', e);
    }
  }, [userId]);

  useEffect(() => {
    load();
    return dbEvents.on('categories:changed', load);
  }, [load]);

  // Seed defaults when a user has no categories yet
  const seedDefaults = useCallback(() => {
    if (!userId) return;
    const existing = db.select().from(categories).where(eq(categories.userId, userId)).all();
    if (existing.length > 0) return;
    for (const cat of DEFAULT_CATEGORIES) {
      db.insert(categories).values({
        id: generateId(),
        userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        budgetLimit: null,
        createdAt: new Date(),
      }).run();
    }
    dbEvents.emit('categories:changed');
  }, [userId]);

  const createCategory = useCallback(
    (input: { name: string; icon?: string; color?: string; budgetLimit?: number }) => {
      if (!userId) return;
      db.insert(categories).values({
        id: generateId(),
        userId,
        name: input.name,
        icon: input.icon ?? null,
        color: input.color ?? null,
        budgetLimit: input.budgetLimit ?? null,
        createdAt: new Date(),
      }).run();
      dbEvents.emit('categories:changed');
    },
    [userId],
  );

  const updateCategory = useCallback(
    (
      id: string,
      input: Partial<{ name: string; icon: string | null; color: string | null; budgetLimit: number | null }>,
    ) => {
      db.update(categories).set(input).where(eq(categories.id, id)).run();
      dbEvents.emit('categories:changed');
    },
    [],
  );

  const deleteCategory = useCallback((id: string) => {
    db.delete(categories).where(eq(categories.id, id)).run();
    dbEvents.emit('categories:changed');
  }, []);

  return { categories: data, createCategory, updateCategory, deleteCategory, seedDefaults };
}
