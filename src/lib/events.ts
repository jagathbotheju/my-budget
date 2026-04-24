type Listener = () => void;
type EventName = 'budgets:changed' | 'transactions:changed' | 'categories:changed';

const listeners: Partial<Record<EventName, Listener[]>> = {};

export const dbEvents = {
  emit(event: EventName) {
    (listeners[event] ?? []).forEach((fn) => fn());
  },
  on(event: EventName, fn: Listener): () => void {
    if (!listeners[event]) listeners[event] = [];
    listeners[event]!.push(fn);
    return () => {
      listeners[event] = listeners[event]!.filter((l) => l !== fn);
    };
  },
};
