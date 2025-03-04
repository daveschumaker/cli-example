import { describe, test, expect } from 'vitest';
import { historyOperations } from './useInputHistory.js';

describe('historyOperations', () => {
  test('addToHistory adds an entry to history', () => {
    const history = ['first', 'second'];
    const newHistory = historyOperations.addToHistory(history, 'third');
    
    expect(newHistory).toEqual(['first', 'second', 'third']);
    // Original array is not modified
    expect(history).toEqual(['first', 'second']);
  });
  
  test('addToHistory collapses adjacent duplicates', () => {
    // Test with adjacent duplicates
    const historyWithAdjacentDuplicates = ['first', 'second', 'second'];
    const newHistory1 = historyOperations.addToHistory(historyWithAdjacentDuplicates, 'third');
    
    // Should collapse the adjacent 'second' entries
    expect(newHistory1).toEqual(['first', 'second', 'third']);
    
    // Adding a duplicate of the most recent entry
    const newHistory2 = historyOperations.addToHistory(['first', 'second', 'third'], 'third');
    
    // Should not add a duplicate of the most recent entry
    expect(newHistory2).toEqual(['first', 'second', 'third']);
    
    // Non-adjacent duplicates should be preserved
    const nonAdjacentDuplicates = ['hello', 'hi', 'hello', 'hey'];
    const newHistory3 = historyOperations.addToHistory(nonAdjacentDuplicates, 'world');
    
    // Should preserve non-adjacent duplicates
    expect(newHistory3).toEqual(['hello', 'hi', 'hello', 'hey', 'world']);
    
    // Empty history
    const emptyHistory: string[] = [];
    const newHistory4 = historyOperations.addToHistory(emptyHistory, 'first');
    expect(newHistory4).toEqual(['first']);
  });
  
  test('addToHistory ignores empty entries', () => {
    const history = ['entry'];
    
    expect(historyOperations.addToHistory(history, '')).toEqual(history);
    expect(historyOperations.addToHistory(history, '   ')).toEqual(history);
  });
  
  test('getPreviousEntry returns most recent entry first', () => {
    const history = ['first', 'second', 'third'];
    const currentIndex = -1; // Initial state
    
    const result = historyOperations.getPreviousEntry(history, currentIndex);
    
    expect(result.entry).toBe('third'); // Most recent entry
    expect(result.newIndex).toBe(0);
  });
  
  test('getPreviousEntry navigates through history', () => {
    const history = ['first', 'second', 'third'];
    
    // First time we press up arrow
    const result1 = historyOperations.getPreviousEntry(history, -1);
    expect(result1.entry).toBe('third');
    expect(result1.newIndex).toBe(0);
    
    // Second time we press up arrow
    const result2 = historyOperations.getPreviousEntry(history, result1.newIndex);
    expect(result2.entry).toBe('second');
    expect(result2.newIndex).toBe(1);
    
    // Third time we press up arrow
    const result3 = historyOperations.getPreviousEntry(history, result2.newIndex);
    expect(result3.entry).toBe('first');
    expect(result3.newIndex).toBe(2);
    
    // Fourth time we press up arrow (should stay at oldest entry)
    const result4 = historyOperations.getPreviousEntry(history, result3.newIndex);
    expect(result4.entry).toBe('first');
    expect(result4.newIndex).toBe(2);
  });
  
  test('getPreviousEntry handles empty history', () => {
    const history: string[] = [];
    const result = historyOperations.getPreviousEntry(history, -1);
    
    expect(result.entry).toBe('');
    expect(result.newIndex).toBe(-1);
  });
  
  test('getPreviousEntry handles invalid index', () => {
    const history = ['first', 'second', 'third'];
    
    // Test with negative index beyond -1
    const result1 = historyOperations.getPreviousEntry(history, -2);
    expect(result1.entry).toBe('third');
    expect(result1.newIndex).toBe(0);
    
    // Test with index greater than history length
    const result2 = historyOperations.getPreviousEntry(history, 5);
    expect(result2.entry).toBe('first');
    expect(result2.newIndex).toBe(2);
  });
  
  test('getNextEntry navigates forward through history', () => {
    const history = ['first', 'second', 'third'];
    
    // Assume we navigated back to the first entry
    const currentIndex = 2;
    
    // First time we press down arrow
    const result1 = historyOperations.getNextEntry(history, currentIndex);
    expect(result1.entry).toBe('second');
    expect(result1.newIndex).toBe(1);
    
    // Second time we press down arrow
    const result2 = historyOperations.getNextEntry(history, result1.newIndex);
    expect(result2.entry).toBe('third');
    expect(result2.newIndex).toBe(0);
    
    // Third time we press down arrow (should clear input)
    const result3 = historyOperations.getNextEntry(history, result2.newIndex);
    expect(result3.entry).toBe('');
    expect(result3.newIndex).toBe(-1);
    
    // Fourth time we press down arrow (should do nothing)
    const result4 = historyOperations.getNextEntry(history, result3.newIndex);
    expect(result4.entry).toBe('');
    expect(result4.newIndex).toBe(-1);
  });
  
  test('getNextEntry handles index at beginning', () => {
    const history = ['first', 'second'];
    
    // Starting from non-history position
    const result = historyOperations.getNextEntry(history, -1);
    
    expect(result.entry).toBe('');
    expect(result.newIndex).toBe(-1);
  });
  
  test('getNextEntry handles invalid index', () => {
    const history = ['first', 'second', 'third'];
    
    // Test with negative index beyond -1
    const result1 = historyOperations.getNextEntry(history, -2);
    expect(result1.entry).toBe('');
    expect(result1.newIndex).toBe(-1);
    
    // Test with index greater than history length
    const result2 = historyOperations.getNextEntry(history, 5);
    expect(result2.entry).toBe('second');
    expect(result2.newIndex).toBe(1);
  });
  
  test('history operations handle large history arrays efficiently', () => {
    // Create a large history array
    const largeHistory = Array.from({ length: 1000 }, (_, i) => `command-${i}`);
    
    // Test that operations complete within a reasonable time
    const startTime = performance.now();
    
    // Add to history
    const newHistory = historyOperations.addToHistory(largeHistory, 'new-command');
    expect(newHistory.length).toBe(largeHistory.length + 1);
    
    // Navigate through history
    const prevResult = historyOperations.getPreviousEntry(largeHistory, 500);
    expect(prevResult.entry).toBe('command-498');
    
    const nextResult = historyOperations.getNextEntry(largeHistory, 500);
    expect(nextResult.entry).toBe('command-500');
    
    const endTime = performance.now();
    
    // Operations should complete in under 100ms for large arrays
    expect(endTime - startTime).toBeLessThan(100);
  });
});