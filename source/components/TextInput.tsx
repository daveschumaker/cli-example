import * as React from 'react';
import { Box, Text, useStdin } from 'ink';
import { useState, useEffect } from 'react';
import { useTextWithCursor } from '../hooks/useTextWithCursor.js';
import { useInputHistory } from '../hooks/useInputHistory.js';
import { createKeyHandler } from '../utils/keyHandlers.js';
import { CommandController } from '../utils/CommandController.js';
import { ResponseText } from './ResponseText.js';
import { sendApiRequest } from '../api/apiService.js';

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
  const [submissionHistory, setSubmissionHistory] = useState<
    Array<{
      text: string;
      type: 'user-input' | 'system-response';
    }>
  >([]);
  const { addToHistory, getPreviousEntry, getNextEntry } = useInputHistory();

  const commandController = React.useMemo(() => {
    return new CommandController({
      onOutput: (output) => {
        const systemResponses = output.map((text) => ({
          text,
          type: 'system-response' as const
        }));
        setSubmissionHistory((prev) => [...prev, ...systemResponses]);
      },
      onClear: () => {
        setSubmissionHistory([]);
      }
    });
  }, []);

  const { stdin, setRawMode } = useStdin();

  const handleSubmit = (submittedText: string) => {
    if (submittedText.trim()) {
      setSubmissionHistory((prev) => [
        ...prev,
        { text: submittedText, type: 'user-input' }
      ]);

      addToHistory(submittedText);

      if (submittedText.startsWith('/')) {
        commandController.processCommand(submittedText);
      } else {
        sendApiRequest(submittedText).then((response: string) => {
          setSubmissionHistory((prev) => [
            ...prev,
            { text: response, type: 'system-response' }
          ]);
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
      return;
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
      {submissionHistory.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          {submissionHistory.slice(-10).map((item, index) => (
            <ResponseText key={index} type={item.type}>
              {item.text}
            </ResponseText>
          ))}
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
