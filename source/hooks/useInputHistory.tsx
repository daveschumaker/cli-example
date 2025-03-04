import { useState, useCallback } from 'react';

/**
 * History operation functions that can be tested independently
 */
export const historyOperations = {
  /**
   * Add an entry to history if it's not empty
   * Collapses adjacent duplicates to keep history clean
   */
  addToHistory: (history: string[], entry: string): string[] => {
    if (!entry.trim()) return history;

    // If the entry is the same as the most recent entry, don't add it
    if (history.length > 0 && history[history.length - 1]! === entry) {
      return [...history];
    }

    // Create a new array for the result, collapsing adjacent duplicates
    const result: string[] = [];

    for (let i = 0; i < history.length; i++) {
      // Skip items that are duplicates of their immediate predecessor
      if (i > 0 && history[i]! === history[i - 1]!) {
        continue;
      }
      result.push(history[i]!);
    }

    // Add the new entry
    return [...result, entry];
  },

  /**
   * Get previous entry in history (for up arrow)
   */
  getPreviousEntry: (
    history: string[],
    currentIndex: number
  ): { entry: string; newIndex: number } => {
    if (history.length === 0) return { entry: '', newIndex: -1 };
    
    // Normalize the current index in case it's invalid
    let normalizedIndex = currentIndex;
    if (normalizedIndex < -1) normalizedIndex = -1;
    if (normalizedIndex >= history.length) normalizedIndex = history.length - 1;
    
    const newIndex =
      normalizedIndex < history.length - 1 ? normalizedIndex + 1 : history.length - 1;

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
    // If at beginning or invalid index, return empty
    if (currentIndex <= 0 || currentIndex < -1) {
      return { entry: '', newIndex: -1 };
    }
    
    // Normalize index if it's beyond array bounds
    let normalizedIndex = currentIndex;
    if (normalizedIndex >= history.length) normalizedIndex = history.length - 1;

    const newIndex = normalizedIndex - 1;
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
