import { Box, Text } from 'ink';
import React, { useState } from 'react';

interface TextInputProps {
  onSubmit?: (text: string) => void;
}

const TextInput: React.FC<TextInputProps> = () => {
  const [text] = useState('');

  return (
    <Box flexDirection="column" width="100%">
      <Box
        width="100%"
        borderStyle="round"
        borderColor="gray"
        paddingY={0}
        paddingX={1}
      >
        <Text>
          <Text bold color="green">
            &gt;{' '}
          </Text>
          {text}
        </Text>
      </Box>
    </Box>
  );
};

export default TextInput;
