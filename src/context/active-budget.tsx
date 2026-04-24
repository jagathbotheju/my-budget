import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ACTIVE_BUDGET_KEY = '@my_budget_active_id';

type ActiveBudgetContextType = {
  activeBudgetId: string | null;
  setActiveBudgetId: (id: string | null) => Promise<void>;
  isLoaded: boolean;
};

const ActiveBudgetContext = createContext<ActiveBudgetContextType>({
  activeBudgetId: null,
  setActiveBudgetId: async () => {},
  isLoaded: false,
});

export function ActiveBudgetProvider({ children }: { children: React.ReactNode }) {
  const [activeBudgetId, setActiveBudgetIdState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ACTIVE_BUDGET_KEY)
      .then((id) => {
        if (id) setActiveBudgetIdState(id);
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const setActiveBudgetId = useCallback(async (id: string | null) => {
    setActiveBudgetIdState(id);
    if (id) {
      await AsyncStorage.setItem(ACTIVE_BUDGET_KEY, id);
    } else {
      await AsyncStorage.removeItem(ACTIVE_BUDGET_KEY);
    }
  }, []);

  return (
    <ActiveBudgetContext.Provider value={{ activeBudgetId, setActiveBudgetId, isLoaded }}>
      {children}
    </ActiveBudgetContext.Provider>
  );
}

export function useActiveBudget() {
  return useContext(ActiveBudgetContext);
}
