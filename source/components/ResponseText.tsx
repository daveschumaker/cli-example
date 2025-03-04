import * as React from 'react';
import { Text } from 'ink';

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
      <Text>
        <Text color="green" bold>{'> '}</Text>
        {children}
      </Text>
    );
  } else {
    return (
      <Text color="cyan">
        {children}
      </Text>
    );
  }
}