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

  // Additional tests for robustness

  test('backspace on empty string remains unchanged', () => {
    const initialText = '';
    const cursorPos = 0;
    const result = textOperations.backspace(initialText, cursorPos);
    expect(result.text).toBe('');
    expect(result.cursorPos).toBe(0);
  });

  test('deleteChar on empty string remains unchanged', () => {
    const initialText = '';
    const cursorPos = 0;
    const result = textOperations.deleteChar(initialText, cursorPos);
    expect(result.text).toBe('');
    expect(result.cursorPos).toBe(0);
  });

  test('insert text with emoji characters updates correctly', () => {
    const initialText = 'Hello';
    const initialCursorPos = 5;
    const emoji = '😊';
    const result = textOperations.insertText(
      initialText,
      initialCursorPos,
      emoji
    );
    expect(result.text).toBe('Hello' + emoji);
    expect(result.cursorPos).toBe(5 + emoji.length);
  });

  test('sequential operations: insert then backspace returns original text', () => {
    const initialText = 'Test';
    const initialCursorPos = 2;
    // Insert a character
    const inserted = textOperations.insertText(
      initialText,
      initialCursorPos,
      'X'
    );
    // Then backspace at the new cursor position
    const result = textOperations.backspace(inserted.text, inserted.cursorPos);
    // Expect to return to original text
    expect(result.text).toBe(initialText);
    expect(result.cursorPos).toBe(initialCursorPos);
  });

  test('deleteToLineEnd with multi-line text deletes from cursor to end of first line', () => {
    const initialText = 'Hello\nWorld';
    const cursorPos = 3; // In first line "Hel"
    const result = textOperations.deleteToLineEnd(initialText, cursorPos);
    // Assuming deleteToLineEnd should delete the rest of the first line,
    // it should return text up to the newline character.
    expect(result).toBe('Hel');
  });

  test('deleteToLineStart with multi-line text deletes from start of line', () => {
    const initialText = 'Hello\nWorld';
    const cursorPos = 7; // 'Hello\nW', cursor is at 'W' of "World"
    const result = textOperations.deleteToLineStart(initialText, cursorPos);
    // Expected result: delete everything before cursor position, setting cursor to 0.
    expect(result.text).toBe(initialText.slice(cursorPos));
    expect(result.cursorPos).toBe(0);
  });

  test('backspace with negative cursor position returns unchanged', () => {
    const initialText = 'Test';
    const cursorPos = -1;
    const result = textOperations.backspace(initialText, cursorPos);
    expect(result.text).toBe(initialText);
    expect(result.cursorPos).toBe(cursorPos);
  });

  test('moveCursorLeft with negative cursor position remains unchanged', () => {
    const cursorPos = -5;
    const newPos = textOperations.moveCursorLeft(cursorPos);
    expect(newPos).toBe(cursorPos);
  });

  test('moveCursorRight with cursor beyond text length remains unchanged', () => {
    const initialText = 'Hello';
    const cursorPos = 10;
    const newPos = textOperations.moveCursorRight(initialText, cursorPos);
    expect(newPos).toBe(cursorPos);
  });
});
