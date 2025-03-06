import React, { useContext } from 'react';
import { Text, Box } from 'ink';
import ModeContext from '../context/ModeContext.js';

export default function FooterInfo() {
  const { mode, preferredProvider, selectedModel } = useContext(ModeContext);

  return (
    <Box width="100%" key="cli-footer" paddingX={2}>
      <Text color="gray">
        [ {mode} ] {preferredProvider || 'No Provider'}:{' '}
        {selectedModel || 'No Model'}
      </Text>
    </Box>
  );
}
