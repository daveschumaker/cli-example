import * as React from 'react';
import { Box, Text } from 'ink';

interface ResponseTextProps {
  type: 'user-input' | 'system-response';
  children: React.ReactNode;
}

/**
 * Component for displaying different types of text in the CLI
 * Differentiates between user input and system responses
 */
export function ResponseText({ type, children }: ResponseTextProps) {
  if (type === 'user-input') {
    return (
      <Box paddingBottom={1}>
        <Text color="gray">
          <Text color="green" bold>{'> '}</Text>
          {children}
        </Text>
      </Box>
    );
  } else {
    return (
      <Box paddingBottom={1}>
        <Text color="cyan">
          {children}
        </Text>
      </Box>
    );
  }
}