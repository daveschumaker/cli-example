import * as React from 'react';
import { Box, Text, useStdin } from 'ink';
import { useState, useEffect } from 'react';
import { useTextWithCursor } from '../hooks/useTextWithCursor.js';
import { useInputHistory } from '../hooks/useInputHistory.js';
import { createKeyHandler } from '../utils/keyHandlers.js';
import { CommandController } from '../utils/CommandController.js';
import { ResponseText } from './ResponseText.js';

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
    clear,
    setText,
    setTextWithCursorAtEnd
  } = useTextWithCursor('');
  const [cursorVisible, setCursorVisible] = useState(true);
  // Store both the text and type (user input or system response)
  const [submissionHistory, setSubmissionHistory] = useState<Array<{
    text: string;
    type: 'user-input' | 'system-response';
  }>>([]);
  const { addToHistory, getPreviousEntry, getNextEntry } = useInputHistory();
  
  // Create command controller
  const commandController = React.useMemo(() => {
    return new CommandController({
      onOutput: (output) => {
        // Add system responses to history
        const systemResponses = output.map(text => ({
          text,
          type: 'system-response' as const
        }));
        setSubmissionHistory(prev => [...prev, ...systemResponses]);
      },
      onClear: () => {
        setSubmissionHistory([]);
      }
    });
  }, []);

  // Get stdin from Ink context
  const { stdin, setRawMode } = useStdin();

  // Handle text submission
  const handleSubmit = (submittedText: string) => {
    if (submittedText.trim()) {
      // Always add user input to submission history
      setSubmissionHistory(prev => [
        ...prev,
        { text: submittedText, type: 'user-input' }
      ]);
      
      // Add to input history for up/down navigation
      addToHistory(submittedText);
      
      // Process as command if it starts with a slash
      if (submittedText.startsWith('/')) {
        commandController.processCommand(submittedText);
      }
    }
  };

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
    clear,
    onSubmit: handleSubmit,
    onArrowUp: getPreviousEntry,
    onArrowDown: getNextEntry,
    setText,
    setTextWithCursorAtEnd
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
      {/* Display previous submissions */}
      {submissionHistory.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          {submissionHistory.slice(-10).map((item, index) => (
            <ResponseText key={index} type={item.type}>
              {item.text}
            </ResponseText>
          ))}
        </Box>
      )}
      
      {/* Current input box */}
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
