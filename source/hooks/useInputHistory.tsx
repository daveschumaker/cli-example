import { useState, useCallback } from 'react';

/**
 * History operation functions that can be tested independently
 */
export const historyOperations = {
  /**
   * Add an entry to history if it's not empty
   */
  addToHistory: (history: string[], entry: string): string[] => {
    if (entry.trim()) {
      return [...history, entry];
    }
    return history;
  },

  /**
   * Get previous entry in history (for up arrow)
   */
  getPreviousEntry: (
    history: string[],
    currentIndex: number
  ): { entry: string; newIndex: number } => {
    if (history.length === 0) return { entry: '', newIndex: currentIndex };

    const newIndex =
      currentIndex < history.length - 1 ? currentIndex + 1 : history.length - 1;

    return {
      entry: history[history.length - 1 - newIndex] ?? '',
      newIndex
    };
  },

  /**
   * Get next entry in history (for down arrow)
   */
  getNextEntry: (
    history: string[],
    currentIndex: number
  ): { entry: string; newIndex: number } => {
    if (currentIndex <= 0) {
      return { entry: '', newIndex: -1 };
    }

    const newIndex = currentIndex - 1;
    return {
      entry: history[history.length - 1 - newIndex] ?? '',
      newIndex
    };
  }
};

/**
 * Hook to manage input history
 */
export function useInputHistory(initialHistory: string[] = []) {
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Add a new entry to history
  const addToHistory = useCallback((entry: string) => {
    if (entry.trim()) {
      setHistory((prev) => historyOperations.addToHistory(prev, entry));
      setHistoryIndex(-1); // Reset index when adding new entry
    }
  }, []);

  // Get previous history entry (up arrow)
  const getPreviousEntry = useCallback(() => {
    const result = historyOperations.getPreviousEntry(history, historyIndex);
    setHistoryIndex(result.newIndex);
    return result.entry;
  }, [history, historyIndex]);

  // Get next history entry (down arrow)
  const getNextEntry = useCallback(() => {
    const result = historyOperations.getNextEntry(history, historyIndex);
    setHistoryIndex(result.newIndex);
    return result.entry;
  }, [history, historyIndex]);

  // Reset history navigation
  const resetNavigation = useCallback(() => {
    setHistoryIndex(-1);
  }, []);

  return {
    history,
    addToHistory,
    getPreviousEntry,
    getNextEntry,
    resetNavigation
  };
}
