import * as React from 'react';
import {
  ARROW_LEFT,
  ARROW_RIGHT,
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

/**
 * Creates a key handler function for terminal input
 */
export function createKeyHandler({
  text,
  insertText,
  backspace,
  deleteChar,
  moveCursorLeft,
  moveCursorRight,
  moveCursorToStart,
  moveCursorToEnd,
  deleteToLineStart,
  deleteToLineEnd,
  clear,
  onSubmit
}: {
  text: string;
  insertText: (input: string) => void;
  backspace: () => void;
  deleteChar: () => void;
  moveCursorLeft: () => void;
  moveCursorRight: () => void;
  moveCursorToStart: () => void;
  moveCursorToEnd: () => void;
  deleteToLineStart: () => void;
  deleteToLineEnd: () => void;
  clear: () => void;
  onSubmit?: (submittedText: string) => void;
}) {
  return React.useCallback(
    (data: string | Buffer) => {
      const strData = data.toString();

      // Mapping of key actions to handle specific events
      const keyActions = new Map([
        [CTRL_C, () => process.exit(0)],
        [BACKSPACE, backspace],
        [CTRL_H, backspace],
        [DELETE, deleteChar],
        [CTRL_U, deleteToLineStart],
        [CTRL_K, deleteToLineEnd],
        [ARROW_LEFT, moveCursorLeft],
        [ARROW_RIGHT, moveCursorRight],
        [HOME, moveCursorToStart],
        [END, moveCursorToEnd],
        [CTRL_A, moveCursorToStart],
        [CTRL_E, moveCursorToEnd]
      ]);

      if (keyActions.has(strData)) {
        keyActions.get(strData)!();
      } else if (strData.includes('[3~')) {
        // Handle delete event when using escape sequence format
        deleteChar();
      } else if (strData === '\r' || strData === '\n') {
        // If onSubmit is provided, use it to handle submitted text
        if (onSubmit) {
          onSubmit(text);
        } else {
          // Fallback to console log for backward compatibility
          console.log('>', text);
        }

        // Always clear the input field after submission
        clear();
      } else if (!strData.startsWith('\x1B')) {
        // Regular text input (not an escape sequence)
        insertText(strData);
      }
    },
    [
      text,
      insertText,
      backspace,
      deleteChar,
      moveCursorLeft,
      moveCursorRight,
      moveCursorToStart,
      moveCursorToEnd,
      deleteToLineStart,
      deleteToLineEnd,
      clear,
      onSubmit
    ]
  );
}
