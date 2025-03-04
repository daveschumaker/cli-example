import { describe, test, expect } from 'vitest';
import { textOperations } from './useTextWithCursor.js';

describe('useTextWithCursor functionality', () => {
  test('backspace removes character before cursor', () => {
    const initialText = 'Hello';
    const initialCursorPos = initialText.length;

    // Use the pure function from textOperations
    const result = textOperations.backspace(initialText, initialCursorPos);

    expect(result.text).toBe('Hell');
    expect(result.cursorPos).toBe(4);
  });

  test('backspace does nothing at beginning of text', () => {
    const initialText = 'Hello';
    const initialCursorPos = 0;

    // Use the pure function from textOperations
    const result = textOperations.backspace(initialText, initialCursorPos);

    // Should not change when cursor is at the beginning
    expect(result.text).toBe('Hello');
    expect(result.cursorPos).toBe(0);
  });

  test('delete removes character at cursor position', () => {
    const initialText = 'Hello';
    const initialCursorPos = 0; // Start at the beginning

    // Use the pure function from textOperations
    const result = textOperations.deleteChar(initialText, initialCursorPos);

    expect(result.text).toBe('ello');
    expect(result.cursorPos).toBe(0); // Cursor position doesn't change
  });

  test('delete does nothing at end of text', () => {
    const initialText = 'Hello';
    const initialCursorPos = initialText.length;

    // Use the pure function from textOperations
    const result = textOperations.deleteChar(initialText, initialCursorPos);

    // Should not change when cursor is at the end
    expect(result.text).toBe('Hello');
    expect(result.cursorPos).toBe(initialCursorPos);
  });

  test('cursor navigation moves left correctly', () => {
    const initialCursorPos = 5;

    // Use the pure function from textOperations
    const newPos = textOperations.moveCursorLeft(initialCursorPos);
    expect(newPos).toBe(4);

    // Move left again
    const finalPos = textOperations.moveCursorLeft(newPos);
    expect(finalPos).toBe(3);
  });

  test('cursor navigation moves right correctly', () => {
    const initialText = 'Hello';
    const initialCursorPos = 3;

    // Use the pure function from textOperations
    const newPos = textOperations.moveCursorRight(
      initialText,
      initialCursorPos
    );
    expect(newPos).toBe(4);
  });

  test('cursor navigation does not move left past start', () => {
    const initialCursorPos = 0;

    // Use the pure function from textOperations
    const newPos = textOperations.moveCursorLeft(initialCursorPos);
    expect(newPos).toBe(0); // Should not change
  });

  test('cursor navigation does not move right past end', () => {
    const initialText = 'Hello';
    const initialCursorPos = initialText.length;

    // Use the pure function from textOperations
    const newPos = textOperations.moveCursorRight(
      initialText,
      initialCursorPos
    );
    expect(newPos).toBe(initialCursorPos); // Should not change
  });

  test('insert text works correctly', () => {
    const initialText = 'Hello';
    const initialCursorPos = 1; // After 'H'

    // Use the pure function from textOperations
    const result = textOperations.insertText(
      initialText,
      initialCursorPos,
      'i'
    );

    expect(result.text).toBe('Hiello');
    expect(result.cursorPos).toBe(2); // Moved past inserted text
  });

  test('delete to line end works correctly', () => {
    const initialText = 'Hello world';
    const cursorPos = 5; // After 'Hello'

    // Use the pure function from textOperations
    const result = textOperations.deleteToLineEnd(initialText, cursorPos);

    expect(result).toBe('Hello');
  });
});
