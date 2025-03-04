import * as React from 'react';
import { Box, Text, useStdin } from 'ink';
import { useState, useEffect } from 'react';
import { useTextWithCursor } from '../hooks/useTextWithCursor.js';
import { createKeyHandler } from '../utils/keyHandlers.js';

export default function TextInput() {
  const {
    text,
    cursorPos,
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
  } = useTextWithCursor('');
  const [cursorVisible, setCursorVisible] = useState(true);

  // Get stdin from Ink context
  const { stdin, setRawMode } = useStdin();

  // Enable raw mode when component mounts
  useEffect(() => {
    if (setRawMode) {
      setRawMode(true);
      // Make sure to disable raw mode when component unmounts
      return () => {
        setRawMode(false);
      };
    }
    return undefined;
  }, [setRawMode]);

  // Blink the cursor
  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Create key handler with all the necessary functions
  const handleDirectInput = createKeyHandler({
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
    clear
  });

  // Set up event listener for stdin
  useEffect(() => {
    if (!stdin) return undefined;
    const onData = (data: Buffer): void => {
      handleDirectInput(data.toString());
      return;
    };
    // Cast stdin to any to bypass TypeScript errors regarding internal_eventEmitter
    if ((stdin as any).internal_eventEmitter) {
      (stdin as any).internal_eventEmitter.on('input', onData);
    } else {
      stdin.on('data', onData);
    }
    return () => {
      if ((stdin as any).internal_eventEmitter) {
        (stdin as any).internal_eventEmitter.off('input', onData);
      } else {
        stdin.off('data', onData);
      }
    };
  }, [stdin, handleDirectInput]);

  // Split text for rendering with cursor
  const beforeCursor = text.slice(0, cursorPos);
  const atCursor = text[cursorPos] || ' ';
  const afterCursor = text.slice(cursorPos + 1);

  return (
    <Box flexDirection="column" width="100%">
      <Box
        width="100%"
        borderStyle="round"
        borderColor="gray"
        paddingX={1}
        paddingY={0}
      >
        <Text>
          <Text bold color="green">
            {'>'}{' '}
          </Text>
          {beforeCursor}
          <Text
            inverse={cursorVisible}
            backgroundColor={cursorVisible ? 'white' : undefined}
          >
            {atCursor}
          </Text>
          {afterCursor}
        </Text>
      </Box>
    </Box>
  );
}
