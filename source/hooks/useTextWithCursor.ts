import { useState } from 'react';

/**
 * Text operation functions that can be tested independently
 */
export const textOperations = {
  insertText: (text: string, cursorPos: number, input: string) => {
    const newText = text.slice(0, cursorPos) + input + text.slice(cursorPos);
    const newCursorPos = cursorPos + input.length;
    return { text: newText, cursorPos: newCursorPos };
  },

  backspace: (text: string, cursorPos: number) => {
    if (cursorPos > 0) {
      const newText = text.slice(0, cursorPos - 1) + text.slice(cursorPos);
      const newCursorPos = cursorPos - 1;
      return { text: newText, cursorPos: newCursorPos };
    }
    return { text, cursorPos };
  },

  deleteChar: (text: string, cursorPos: number) => {
    if (cursorPos < text.length) {
      const newText = text.slice(0, cursorPos) + text.slice(cursorPos + 1);
      return { text: newText, cursorPos };
    }
    return { text, cursorPos };
  },

  moveCursorLeft: (cursorPos: number) => {
    return cursorPos > 0 ? cursorPos - 1 : cursorPos;
  },

  moveCursorRight: (text: string, cursorPos: number) => {
    return cursorPos < text.length ? cursorPos + 1 : cursorPos;
  },

  deleteToLineEnd: (text: string, cursorPos: number) => {
    if (cursorPos < text.length) {
      return text.slice(0, cursorPos);
    }
    return text;
  },

  deleteToLineStart: (text: string, cursorPos: number) => {
    if (cursorPos > 0) {
      return { text: text.slice(cursorPos), cursorPos: 0 };
    }
    return { text, cursorPos };
  }
};

/**
 * Custom hook for managing text input with cursor positioning
 * Provides functions for text manipulation and cursor movement
 */
export function useTextWithCursor(initialText = '') {
  const [text, setText] = useState(initialText);
  const [cursorPos, setCursorPos] = useState(initialText.length);

  const insertText = (input: string) => {
    const result = textOperations.insertText(text, cursorPos, input);
    setText(result.text);
    setCursorPos(result.cursorPos);
  };

  const backspace = () => {
    const result = textOperations.backspace(text, cursorPos);
    setText(result.text);
    setCursorPos(result.cursorPos);
  };

  const deleteChar = () => {
    const result = textOperations.deleteChar(text, cursorPos);
    setText(result.text);
    setCursorPos(result.cursorPos);
  };

  const moveCursorLeft = () => {
    setCursorPos(textOperations.moveCursorLeft(cursorPos));
  };

  const moveCursorRight = () => {
    setCursorPos(textOperations.moveCursorRight(text, cursorPos));
  };

  const moveCursorToStart = () => {
    setCursorPos(0);
  };

  const moveCursorToEnd = () => {
    setCursorPos(text.length);
  };

  const clear = () => {
    setText('');
    setCursorPos(0);
  };

  const deleteToLineEnd = () => {
    setText(textOperations.deleteToLineEnd(text, cursorPos));
  };

  const deleteToLineStart = () => {
    const result = textOperations.deleteToLineStart(text, cursorPos);
    setText(result.text);
    setCursorPos(result.cursorPos);
  };

  return {
    text,
    setText,
    cursorPos,
    setCursorPos,
    insertText,
    backspace,
    deleteChar,
    moveCursorLeft,
    moveCursorRight,
    moveCursorToStart,
    moveCursorToEnd,
    deleteToLineEnd,
    deleteToLineStart,
    clear
  };
}
