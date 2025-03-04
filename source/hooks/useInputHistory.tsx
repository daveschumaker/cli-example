import { useState, useCallback } from 'react';

/**
 * Hook to manage input history
 */
export function useInputHistory(initialHistory: string[] = []) {
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Add a new entry to history
  const addToHistory = useCallback((entry: string) => {
    if (entry.trim()) {
      setHistory(prev => [...prev, entry]);
      setHistoryIndex(-1); // Reset index when adding new entry
    }
  }, []);

  // Get previous history entry (up arrow)
  const getPreviousEntry = useCallback(() => {
    if (history.length === 0) return '';
    
    const newIndex = historyIndex < history.length - 1 
      ? historyIndex + 1 
      : history.length - 1;
    
    setHistoryIndex(newIndex);
    return history[history.length - 1 - newIndex];
  }, [history, historyIndex]);

  // Get next history entry (down arrow)
  const getNextEntry = useCallback(() => {
    if (historyIndex <= 0) {
      setHistoryIndex(-1);
      return '';
    }
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    return history[history.length - 1 - newIndex];
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