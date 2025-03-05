import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

const SPINNER_SPEED = 80; // Animation speed in milliseconds
const SPINNER_COLOR = 'cyan'; // Spinner color

export default function Spinner() {
  const asciiSpinner = [
    '|•     |',
    '| •    |',
    '|  •   |',
    '|   •  |',
    '|    • |',
    '|     •|',
    '|    • |',
    '|   •  |',
    '|  •   |',
    '| •    |'
  ];

  const [frameIndex, setFrameIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const spinnerInterval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % asciiSpinner.length);
    }, SPINNER_SPEED);
    return () => clearInterval(spinnerInterval);
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  return (
    <Box>
      <Text color={SPINNER_COLOR}>{asciiSpinner[frameIndex]}</Text>
      <Text color="gray"> ({seconds}s elapsed...)</Text>
    </Box>
  );
}
