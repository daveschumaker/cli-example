import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { createKeyHandler } from './keyHandlers.js';
import {
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  ARROW_DOWN,
  BACKSPACE,
  DELETE,
  CTRL_C,
  CTRL_U,
  CTRL_K,
  CTRL_H,
  HOME,
  END,
  CTRL_A,
  CTRL_E
} from './constants.js';

// Mock React's useCallback to just return the callback function
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: (callback: any) => callback
  };
});

// Mock process.exit to prevent tests from exiting
const mockExit = vi
  .spyOn(process, 'exit')
  .mockImplementation((() => {}) as any);

describe('keyHandlers', () => {
  // Setup common mocks for each test
  let mockHandlers: {
    text: string;
    insertText: Mock;
    backspace: Mock;
    deleteChar: Mock;
    moveCursorLeft: Mock;
    moveCursorRight: Mock;
    moveCursorToStart: Mock;
    moveCursorToEnd: Mock;
    deleteToLineStart: Mock;
    deleteToLineEnd: Mock;
    clear: Mock;
    onArrowUp?: Mock;
    onArrowDown?: Mock;
    setText?: Mock;
    setTextWithCursorAtEnd?: Mock;
  };

  let handleKey: (data: string | Buffer) => void;

  // Spy on console.log
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock handlers for each test
    mockHandlers = {
      text: 'sample text',
      insertText: vi.fn(),
      backspace: vi.fn(),
      deleteChar: vi.fn(),
      moveCursorLeft: vi.fn(),
      moveCursorRight: vi.fn(),
      moveCursorToStart: vi.fn(),
      moveCursorToEnd: vi.fn(),
      deleteToLineStart: vi.fn(),
      deleteToLineEnd: vi.fn(),
      clear: vi.fn()
    };

    // Create the handler using our mocks
    handleKey = createKeyHandler(mockHandlers);
  });

  test('should handle backspace key', () => {
    handleKey(BACKSPACE);
    expect(mockHandlers.backspace).toHaveBeenCalledTimes(1);
  });

  test('should handle Ctrl+H as backspace alternative', () => {
    handleKey(CTRL_H);
    expect(mockHandlers.backspace).toHaveBeenCalledTimes(1);
  });

  test('should handle delete key', () => {
    handleKey(DELETE);
    expect(mockHandlers.deleteChar).toHaveBeenCalledTimes(1);
  });

  test('should handle alternative delete escape sequence', () => {
    handleKey('other[3~stuff'); // Any string containing [3~
    expect(mockHandlers.deleteChar).toHaveBeenCalledTimes(1);
  });

  test('should handle arrow left', () => {
    handleKey(ARROW_LEFT);
    expect(mockHandlers.moveCursorLeft).toHaveBeenCalledTimes(1);
  });

  test('should handle arrow right', () => {
    handleKey(ARROW_RIGHT);
    expect(mockHandlers.moveCursorRight).toHaveBeenCalledTimes(1);
  });
  
  test('should handle arrow up with history navigation', () => {
    // Setup handler with history navigation
    const onArrowUp = vi.fn().mockReturnValue('previous entry');
    const setTextWithCursorAtEnd = vi.fn();
    
    const handlerWithHistory = createKeyHandler({
      ...mockHandlers,
      onArrowUp,
      setTextWithCursorAtEnd
    });
    
    handlerWithHistory(ARROW_UP);
    
    expect(onArrowUp).toHaveBeenCalledTimes(1);
    expect(setTextWithCursorAtEnd).toHaveBeenCalledWith('previous entry');
  });
  
  test('should handle arrow up when no history entry is returned', () => {
    // Setup handler that returns undefined from history
    const onArrowUp = vi.fn().mockReturnValue(undefined);
    const setTextWithCursorAtEnd = vi.fn();
    
    const handlerWithHistory = createKeyHandler({
      ...mockHandlers,
      onArrowUp,
      setTextWithCursorAtEnd
    });
    
    handlerWithHistory(ARROW_UP);
    
    expect(onArrowUp).toHaveBeenCalledTimes(1);
    expect(setTextWithCursorAtEnd).not.toHaveBeenCalled();
  });
  
  test('should do nothing on arrow up when callbacks are not provided', () => {
    // Create handler without history navigation callbacks
    const handler = createKeyHandler({
      ...mockHandlers
    });
    
    // This should not throw or error
    handler(ARROW_UP);
  });
  
  test('should handle arrow down with history navigation', () => {
    // Setup handler with history navigation
    const onArrowDown = vi.fn().mockReturnValue('next entry');
    const setTextWithCursorAtEnd = vi.fn();
    
    const handlerWithHistory = createKeyHandler({
      ...mockHandlers,
      onArrowDown,
      setTextWithCursorAtEnd
    });
    
    handlerWithHistory(ARROW_DOWN);
    
    expect(onArrowDown).toHaveBeenCalledTimes(1);
    expect(setTextWithCursorAtEnd).toHaveBeenCalledWith('next entry');
  });
  
  test('should handle arrow down when no history entry is returned', () => {
    // Setup handler that returns undefined from history
    const onArrowDown = vi.fn().mockReturnValue(undefined);
    const setTextWithCursorAtEnd = vi.fn();
    
    const handlerWithHistory = createKeyHandler({
      ...mockHandlers,
      onArrowDown,
      setTextWithCursorAtEnd
    });
    
    handlerWithHistory(ARROW_DOWN);
    
    expect(onArrowDown).toHaveBeenCalledTimes(1);
    expect(setTextWithCursorAtEnd).not.toHaveBeenCalled();
  });
  
  test('should do nothing on arrow down when callbacks are not provided', () => {
    // Create handler without history navigation callbacks
    const handler = createKeyHandler({
      ...mockHandlers
    });
    
    // This should not throw or error
    handler(ARROW_DOWN);
  });

  test('should handle home key', () => {
    handleKey(HOME);
    expect(mockHandlers.moveCursorToStart).toHaveBeenCalledTimes(1);
  });

  test('should handle Ctrl+A as alternative home', () => {
    handleKey(CTRL_A);
    expect(mockHandlers.moveCursorToStart).toHaveBeenCalledTimes(1);
  });

  test('should handle end key', () => {
    handleKey(END);
    expect(mockHandlers.moveCursorToEnd).toHaveBeenCalledTimes(1);
  });

  test('should handle Ctrl+E as alternative end', () => {
    handleKey(CTRL_E);
    expect(mockHandlers.moveCursorToEnd).toHaveBeenCalledTimes(1);
  });

  test('should handle Ctrl+K to delete to line end', () => {
    handleKey(CTRL_K);
    expect(mockHandlers.deleteToLineEnd).toHaveBeenCalledTimes(1);
  });

  test('should handle Ctrl+U to delete to line start', () => {
    handleKey(CTRL_U);
    expect(mockHandlers.deleteToLineStart).toHaveBeenCalledTimes(1);
  });

  test('should handle Ctrl+C to exit', () => {
    handleKey(CTRL_C);
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  test('should handle return key (Enter) by logging and clearing', () => {
    handleKey('\r');
    expect(consoleSpy).toHaveBeenCalledWith('>', 'sample text');
    expect(mockHandlers.clear).toHaveBeenCalledTimes(1);
  });

  test('should handle Enter key with onSubmit callback', () => {
    const onSubmit = vi.fn();
    const handler = createKeyHandler({
      ...mockHandlers,
      text: 'sample text',
      onSubmit
    });
    handler('\r');
    expect(onSubmit).toHaveBeenCalledWith('sample text');
    expect(mockHandlers.clear).toHaveBeenCalledTimes(1);
  });

  test('should handle newline key (Enter) by logging and clearing when onSubmit is not provided', () => {
    handleKey('\n');
    expect(consoleSpy).toHaveBeenCalledWith('>', 'sample text');
    expect(mockHandlers.clear).toHaveBeenCalledTimes(1);
  });

  test('should handle regular text input', () => {
    handleKey('a');
    expect(mockHandlers.insertText).toHaveBeenCalledWith('a');

    handleKey('hello');
    expect(mockHandlers.insertText).toHaveBeenCalledWith('hello');
  });

  test('should not handle escape sequences as text input', () => {
    handleKey('\x1B[something');
    expect(mockHandlers.insertText).not.toHaveBeenCalled();
  });

  test('should accept Buffer input', () => {
    handleKey(Buffer.from('a'));
    expect(mockHandlers.insertText).toHaveBeenCalledWith('a');
  });
});
