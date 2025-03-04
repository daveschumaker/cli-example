import React from 'react';
import { Box, Text } from 'ink';
import TextInput from './components/TextInput.js';

type Props = {
  name: string | undefined;
};

export default function App({ name = 'Stranger' }: Props) {
  return (
    <Box flexDirection="column">
      <Text>
        Hello, <Text color="green">{name}</Text>
      </Text>
      <TextInput />
    </Box>
  );
}
