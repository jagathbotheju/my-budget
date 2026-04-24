import { eq } from 'drizzle-orm';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../db';
import { type Budget, budgets } from '../db/schema';
import { dbEvents } from '../lib/events';
import { generateId } from '../lib/utils';

export function useBudgets(userId: string | null | undefined) {
  const [data, setData] = useState<Budget[]>([]);

  const load = useCallback(() => {
    if (!userId) { setData([]); return; }
    try {
      const result = db.select().from(budgets).where(eq(budgets.userId, userId)).all();
      setData(result);
    } catch (e) {
      console.error('useBudgets load error', e);
    }
  }, [userId]);

  useEffect(() => {
    load();
    return dbEvents.on('budgets:changed', load);
  }, [load]);

  const createBudget = useCallback(
    (name: string, amount: number) => {
      if (!userId) return;
      db.insert(budgets).values({
        id: generateId(),
        userId,
        name,
        amount,
        createdAt: new Date(),
      }).run();
      dbEvents.emit('budgets:changed');
    },
    [userId],
  );

  const deleteBudget = useCallback((id: string) => {
    db.delete(budgets).where(eq(budgets.id, id)).run();
    dbEvents.emit('budgets:changed');
    dbEvents.emit('transactions:changed');
  }, []);

  return { budgets: data, createBudget, deleteBudget };
}
