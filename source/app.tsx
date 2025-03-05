import React from 'react';
import { Box, Text } from 'ink';
import TextInput from './components/TextInput.js';

export default function App() {
  return (
    <Box flexDirection="column">
      <Box
        paddingY={1}
        width="100%"
        borderStyle="round"
        borderColor="gray"
      >
        <Box padding={1}>
          <Text>
            CLI Example v0.0.1
          </Text>
        </Box>
      </Box>
      <TextInput />
    </Box>
  );
}
