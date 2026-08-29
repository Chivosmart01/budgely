import { create } from 'zustand';

interface BudgetState {
  selectedMonth: number;
  selectedYear: number;
  refreshTrigger: number;
  setMonthYear: (month: number, year: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  triggerRefresh: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => {
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();

  return {
    selectedMonth: defaultMonth,
    selectedYear: defaultYear,
    refreshTrigger: 0,

    setMonthYear: (month, year) => set({ selectedMonth: month, selectedYear: year }),

    nextMonth: () => {
      const { selectedMonth, selectedYear } = get();
      if (selectedMonth === 12) {
        set({ selectedMonth: 1, selectedYear: selectedYear + 1 });
      } else {
        set({ selectedMonth: selectedMonth + 1 });
      }
    },

    prevMonth: () => {
      const { selectedMonth, selectedYear } = get();
      if (selectedMonth === 1) {
        set({ selectedMonth: 12, selectedYear: selectedYear - 1 });
      } else {
        set({ selectedMonth: selectedMonth - 1 });
      }
    },

    triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
  };
});
