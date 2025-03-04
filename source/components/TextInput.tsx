import * as React from 'react';
import { Box, Text, useStdin } from 'ink';
import { useState, useEffect } from 'react';
import { useTextWithCursor } from '../hooks/useTextWithCursor.js';
import { useInputHistory } from '../hooks/useInputHistory.js';
import { useCommand, defaultCommands } from '../hooks/useCommand.js';
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
    clear,
    setText,
    setTextWithCursorAtEnd
  } = useTextWithCursor('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [submittedLines, setSubmittedLines] = useState<string[]>([]);
  const { addToHistory, getPreviousEntry, getNextEntry } = useInputHistory();
  
  // Define custom handlers for built-in commands
  const customCommands = [
    ...defaultCommands.map(cmd => {
      if (cmd.name === 'help') {
        return {
          ...cmd,
          handler: () => {
            // Show all available commands when /help is called
            const commandsList = [
              ...defaultCommands.map(c => `/${c.name} - ${c.description}`)
            ];
            setSubmittedLines(prev => [...prev, ...commandsList]);
          }
        };
      } else if (cmd.name === 'clear') {
        return {
          ...cmd,
          handler: () => {
            // Clear all previous submissions
            setSubmittedLines([]);
          }
        };
      }
      return cmd;
    })
  ];
  
  const { processCommand } = useCommand(customCommands);

  // Get stdin from Ink context
  const { stdin, setRawMode } = useStdin();

  // Handle text submission
  const handleSubmit = (submittedText: string) => {
    if (submittedText.trim()) {
      // Add to submitted lines and history
      setSubmittedLines((prev) => [...prev, submittedText]);
      addToHistory(submittedText);
      
      // Check if it's a slash command
      const isCommand = processCommand(submittedText);
      
      // Display command not found message if it starts with / but isn't recognized
      if (submittedText.startsWith('/') && !isCommand) {
        setSubmittedLines((prev) => [
          ...prev, 
          `Command not found: ${submittedText}. Type /help to see available commands.`
        ]);
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

  // Keep only the last 10 submitted lines to avoid cluttering the UI
  const recentSubmissions = submittedLines.slice(-10);

  return (
    <Box flexDirection="column" width="100%">
      {/* Display previous submissions with grey color */}
      {recentSubmissions.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          {recentSubmissions.map((line, index) => (
            <Text key={index} color="gray">
              {'>'} {line}
            </Text>
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
