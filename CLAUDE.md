# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**My-Budget** is a React Native mobile app for tracking personal expenses. Users manage multiple Budgets, each containing Transactions grouped by Category, with visual summaries and spending history.

**Goal**: Give users a clear view of their monthly expenses and manage transactions within a selected Budget.

---

## Commands

```bash
bun start                  # Start Expo dev server
bun run ios                # Run on iOS simulator
bun run android            # Run on Android emulator
npx expo start --clear     # Clear Metro cache (after config changes)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 55 |
| Navigation | Expo Router (file-based) |
| Styling | Uniwind (Tailwind CSS v4 for React Native) |
| Database | Expo SQLite + Drizzle ORM (sync mode) |
| Auth | Clerk (`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env`) |
| Package Manager | Bun |

---

## Architecture

### File Structure

```
src/
  app/
    _layout.tsx          ← Root layout: ClerkProvider + SafeAreaProvider + DB init + ActiveBudgetProvider
    index.tsx            ← Auth redirect entry point
    (auth)/
      _layout.tsx        ← Redirects signed-in users to /(tabs)
      sign-in.tsx        ← Email / Google / Apple login
    (tabs)/
      _layout.tsx        ← Tab navigator (4 tabs), redirects signed-out users to /(auth)/sign-in
      index.tsx          ← Tab 1: Home
      activity.tsx       ← Tab 2: Activity
      budget.tsx         ← Tab 3: Budget Summary
      settings.tsx       ← Tab 4: Settings
  components/
    ui/                  ← Reusable primitives (Button, Card, FAB, Input, ProgressBar)
    budget/              ← BudgetSelector bottom sheet
    transaction/         ← TransactionItem, TransactionForm
    category/            ← CategoryForm
    charts/              ← Custom bar chart (no external deps)
  context/
    active-budget.tsx    ← React Context + AsyncStorage for selected budget ID
  db/
    schema.ts            ← Drizzle table definitions
    index.ts             ← DB instance + initializeDatabase() (CREATE TABLE IF NOT EXISTS)
  hooks/
    use-budgets.ts       ← CRUD + event-driven reloads
    use-transactions.ts  ← CRUD + filtering by budget/date/category
    use-categories.ts    ← CRUD + default seed on first load
  lib/
    cn.ts                ← tailwind-merge + clsx
    utils.ts             ← formatCurrency, formatDate, generateId, etc.
    events.ts            ← Simple pub/sub for DB change notifications
global.css               ← Tailwind v4 + Uniwind theme (light/dark CSS variables)
metro.config.js
```

### Data Flow

1. **DB init**: `initializeDatabase()` runs in `app/_layout.tsx` on mount via `useEffect`
2. **Active budget**: Persisted to `AsyncStorage` via `ActiveBudgetContext`; all tabs read from `useActiveBudget()`
3. **Hooks**: Each hook calls `db.select()...all()` synchronously and returns data. After any mutation, hooks call `dbEvents.emit(...)` which triggers all subscribed hooks to reload
4. **Auth guard**: Tab layout redirects to sign-in if `!isSignedIn`; auth layout redirects to tabs if `isSignedIn`

### DB Events Pattern

Hooks subscribe to a simple pub/sub emitter so that mutations in one screen automatically refresh data in other screens:

```ts
// After mutation:
dbEvents.emit('transactions:changed');

// In hooks:
useEffect(() => {
  load();
  return dbEvents.on('transactions:changed', load);
}, [load]);
```

---

## Styling — Uniwind

All styles use `className` on React Native components. Theme tokens auto-adapt to light/dark from `global.css`.

### Key Token Usage

| Token | Usage |
|---|---|
| `bg-background`, `text-foreground` | Screen backgrounds and primary text |
| `bg-card`, `text-card-foreground` | Card surfaces |
| `bg-primary`, `text-primary-foreground` | CTAs, active states, FAB (#e36588 pink) |
| `bg-accent`, `text-accent-foreground` | Deep plum highlight (#33032f light / #5c0a56 dark) |
| `text-muted-foreground` | Captions, placeholders |
| `bg-destructive`, `text-destructive-foreground` | Delete actions, negative amounts |
| `text-success` | Positive amounts (#16a34a light / #4ade80 dark) |
| `border-border`, `border-input` | Borders and input outlines |

### Critical Rules

1. **Never wrap `react-native` components** with `withUniwind` — `View`, `Text`, `Pressable`, `TextInput`, `Modal`, `FlatList`, `ScrollView` have built-in `className`.
2. **`withUniwind` only for third-party components** (e.g., `expo-image`).
3. **No dynamic class names** — use ternaries or mapping objects with complete string literals.
4. **`accent-` prefix** for non-style color props: `placeholderTextColorClassName="accent-muted-foreground"`, `colorClassName="accent-primary"`.
5. **Use `cn()`** when mixing custom CSS classes with Tailwind utilities on the same property.
6. **`useCSSVariable`** to pass theme colors into chart libraries or non-className APIs.

### cn Utility (`src/lib/cn.ts`)

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

### Safe Area

Root layout wraps with `SafeAreaProvider` + a `SafeAreaUpdater` component that calls `Uniwind.updateInsets(insets)` via `useSafeAreaInsets`. Use `pt-safe`, `pb-safe`, `pb-safe-offset-4` etc. in screens.

---

## Database — Drizzle ORM (Sync Mode)

All DB operations are **synchronous** (using `openDatabaseSync`):

```ts
db.select().from(table).where(eq(table.id, id)).all()  // returns array
db.insert(table).values({...}).run()
db.update(table).set({...}).where(...).run()
db.delete(table).where(...).run()
```

Tables initialized with `CREATE TABLE IF NOT EXISTS` via `sqlite.execSync()` in `initializeDatabase()`. No drizzle-kit migration files needed.

### Schema Relations

- `Budget` (user-scoped) → has many `Transactions` (cascade delete on budget delete)
- `Category` (user-scoped) → has many `Transactions`
- `Transaction` → belongs to one `Budget` + one `Category`
- Amount convention: **negative = expense**, **positive = income**

---

## Authentication — Clerk

- `ClerkProvider` wraps the root layout with `tokenCache` using `expo-secure-store`
- Auth guard: Tab layout uses `useAuth()` → redirects to `/(auth)/sign-in` if not signed in
- OAuth uses `useOAuth` hook + `expo-web-browser` (already installed)
- Deep linking scheme: `mybudget2` (configured in `app.json`)

---

## Features

### Budgets
- Create / Delete (cascades to all Transactions)
- Select active Budget → persisted via `AsyncStorage`; drives all 4 tabs

### Transactions
- Create / Edit / Delete within active Budget
- Floating Action Button (FAB) on Home and Activity tabs
- Grouped by date in Activity tab

### Categories
- Create / Edit / Delete (user-scoped, shared across all Budgets)
- Default categories seeded on first load if none exist

---

## Screen Details

### Tab 1 — Home
Header (budget selector tap) → Balance card (income/expenses/saved) → Spending bar chart (W/M/Y filter) → FAB

### Tab 2 — Activity
Summary cards (income/expenses) → Category filter chips → Grouped transaction list → Tap transaction → Edit/Delete modal → FAB

### Tab 3 — Budget Summary
Monthly/Yearly toggle → % used indicator → Stats (Spent/Budget/Left) → Progress bar → Categories breakdown list

### Tab 4 — Settings
User profile (Clerk) → Sign out → Budgets list (add/delete) → Categories list (add/edit/delete)

---

## Constraints

- Portrait orientation only (`app.json`)
- `userInterfaceStyle: "automatic"` — Uniwind follows system theme by default
- No `tailwind.config.js` — all config via `@theme` / `@layer theme` in `global.css`
- Do not use `cssInterop` / `remapProps` (NativeWind APIs)
- `withUniwindConfig` must be the **outermost** wrapper in `metro.config.js`
- Clerk Publishable Key in `.env` — do not commit secrets
