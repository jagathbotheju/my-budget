import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../db';
import { categories, type Transaction, transactions } from '../db/schema';
import { dbEvents } from '../lib/events';
import { generateId } from '../lib/utils';

export type TransactionWithCategory = Transaction & {
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
};

export function useTransactions(budgetId: string | null | undefined) {
  const [data, setData] = useState<TransactionWithCategory[]>([]);

  const load = useCallback(() => {
    if (!budgetId) { setData([]); return; }
    try {
      const rows = db
        .select({
          id: transactions.id,
          budgetId: transactions.budgetId,
          categoryId: transactions.categoryId,
          userId: transactions.userId,
          title: transactions.title,
          amount: transactions.amount,
          note: transactions.note,
          date: transactions.date,
          createdAt: transactions.createdAt,
          categoryName: categories.name,
          categoryIcon: categories.icon,
          categoryColor: categories.color,
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(eq(transactions.budgetId, budgetId))
        .orderBy(desc(transactions.date))
        .all();

      setData(
        rows.map((r) => ({
          ...r,
          categoryName: r.categoryName ?? 'Uncategorized',
          categoryIcon: r.categoryIcon ?? null,
          categoryColor: r.categoryColor ?? null,
        })),
      );
    } catch (e) {
      console.error('useTransactions load error', e);
    }
  }, [budgetId]);

  useEffect(() => {
    load();
    return dbEvents.on('transactions:changed', load);
  }, [load]);

  const createTransaction = useCallback(
    (input: {
      userId: string;
      categoryId: string;
      title: string;
      amount: number;
      note?: string;
      date: Date;
    }) => {
      if (!budgetId) return;
      db.insert(transactions).values({
        id: generateId(),
        budgetId,
        userId: input.userId,
        categoryId: input.categoryId,
        title: input.title,
        amount: input.amount,
        note: input.note ?? null,
        date: input.date,
        createdAt: new Date(),
      }).run();
      dbEvents.emit('transactions:changed');
    },
    [budgetId],
  );

  const updateTransaction = useCallback(
    (
      id: string,
      input: Partial<{
        categoryId: string;
        title: string;
        amount: number;
        note: string | null;
        date: Date;
      }>,
    ) => {
      db.update(transactions).set(input).where(eq(transactions.id, id)).run();
      dbEvents.emit('transactions:changed');
    },
    [],
  );

  const deleteTransaction = useCallback((id: string) => {
    db.delete(transactions).where(eq(transactions.id, id)).run();
    dbEvents.emit('transactions:changed');
  }, []);

  const getByDateRange = useCallback(
    (from: Date, to: Date): TransactionWithCategory[] => {
      if (!budgetId) return [];
      try {
        const rows = db
          .select({
            id: transactions.id,
            budgetId: transactions.budgetId,
            categoryId: transactions.categoryId,
            userId: transactions.userId,
            title: transactions.title,
            amount: transactions.amount,
            note: transactions.note,
            date: transactions.date,
            createdAt: transactions.createdAt,
            categoryName: categories.name,
            categoryIcon: categories.icon,
            categoryColor: categories.color,
          })
          .from(transactions)
          .leftJoin(categories, eq(transactions.categoryId, categories.id))
          .where(
            and(
              eq(transactions.budgetId, budgetId),
              gte(transactions.date, from),
              lte(transactions.date, to),
            ),
          )
          .all();

        return rows.map((r) => ({
          ...r,
          categoryName: r.categoryName ?? 'Uncategorized',
          categoryIcon: r.categoryIcon ?? null,
          categoryColor: r.categoryColor ?? null,
        }));
      } catch {
        return [];
      }
    },
    [budgetId],
  );

  return { transactions: data, createTransaction, updateTransaction, deleteTransaction, getByDateRange };
}
