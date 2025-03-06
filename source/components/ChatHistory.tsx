import * as React from 'react';
import { Box, Static } from 'ink';
import { ResponseText } from './ResponseText.js';
import { useChat } from '../context/ChatContext.js';

function ChatHistoryComponent() {
  const { chatHistory } = useChat();

  return (
    <Box flexDirection="column" width="100%">
      {chatHistory.length > 0 && (
        <Static items={chatHistory}>
          {(item, index) => (
            <ResponseText
              key={index}
              type={item.role === 'user' ? 'user-input' : 'system-response'}
            >
              {item.content}
            </ResponseText>
          )}
        </Static>
      )}
    </Box>
  );
}

export const ChatHistory = React.memo(ChatHistoryComponent);
