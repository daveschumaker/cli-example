import React from 'react';
import { Box, Text, Static } from 'ink';
import TextInput from './components/TextInput.js';
import { ModeProvider } from './context/ModeContext.js';
import FooterInfo from './components/FooterInfo.js';
import { ChatProvider } from './context/ChatContext.js';

export default function App() {
  return (
    <ModeProvider>
      <ChatProvider>
        <Box flexDirection="column">
          <Static
            items={[
              <Box
                paddingY={1}
                width="100%"
                borderStyle="round"
                borderColor="gray"
                key="cli-header"
              >
                <Box padding={1}>
                  <Text>CLI Example v0.0.1</Text>
                </Box>
              </Box>
            ]}
          >
            {(item) => item}
          </Static>
          <TextInput />
          <FooterInfo />
        </Box>
      </ChatProvider>
    </ModeProvider>
  );
}
