import * as React from 'react';
import { Box, Text, useStdin } from 'ink';
import { useState, useEffect } from 'react';
import { useTextWithCursor } from '../hooks/useTextWithCursor.js';
import { createKeyHandler } from '../utils/keyHandlers.js';
import { CommandController } from '../utils/CommandController.js';
import Spinner from './Spinner.js';
import { sendApiRequest } from '../api/apiProvider.js';
import ModeContext from '../context/ModeContext.js';
import { useInputHistory } from '../hooks/useInputHistory.js';
import { useChat } from '../context/ChatContext.js';
import { ChatHistory } from './ChatHistory.js';

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
  const [isLoading, setIsLoading] = useState(false);
  const modeContext = React.useContext(ModeContext);
  const { addMessage, clearHistory } = useChat();
  const { addToHistory, getPreviousEntry, getNextEntry } = useInputHistory();
  const { stdin, setRawMode } = useStdin();

  const commandController = React.useMemo(() => {
    return new CommandController({
      onOutput: (output) => {
        output.forEach((text) => {
          addMessage({
            role: 'assistant',
            content: text,
            timestamp: new Date(),
            generation_time: 0,
            tokens: 0
          });
        });
      },
      onClear: () => {
        clearHistory();
      },
      onModeChange: (newMode) => {
        modeContext.setCurrentMode(newMode);
      },
      onModelChange: (newModel) => {
        modeContext.setSelectedModel(newModel);
      },
      onProviderChange: (newProvider) => {
        modeContext.setPreferredProvider(newProvider);
      }
    });
  }, [modeContext, addMessage, clearHistory]);

  const handleSubmit = (submittedText: string) => {
    if (submittedText.trim()) {
      addMessage({
        role: 'user',
        content: submittedText,
        timestamp: new Date(),
        generation_time: 0,
        tokens: 0
      });
      addToHistory(submittedText);

      if (submittedText.startsWith('/')) {
        commandController.processCommand(submittedText);
      } else {
        setIsLoading(true);
        sendApiRequest(submittedText)
          .then((response: string) => {
            addMessage({
              role: 'assistant',
              content: response,
              timestamp: new Date(),
              generation_time: 0,
              tokens: 0
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  };

  useEffect(() => {
    if (setRawMode) {
      setRawMode(true);
      return () => {
        setRawMode(false);
      };
    }
    return undefined;
  }, [setRawMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (!stdin) return undefined;
    const onData = (data: Buffer): void => {
      handleDirectInput(data.toString());
    };
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

  const beforeCursor = text.slice(0, cursorPos);
  const atCursor = text[cursorPos] || ' ';
  const afterCursor = text.slice(cursorPos + 1);

  return (
    <Box flexDirection="column" width="100%">
      <ChatHistory />
      {isLoading && (
        <Box paddingY={1}>
          <Spinner />
        </Box>
      )}
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
