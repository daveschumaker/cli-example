/**
 * This module provides a mock implementation for interfacing with the
 * "LM Studio" service API.
 *
 * It simulates sending a text input to the API and receiving a response after
 * a short delay.
 */

export async function sendLmStudioRequest(prompt: string): Promise<string> {
  // Simulate a network delay of 500 milliseconds
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a mock response based on the input prompt
  return `Response from LM Studio for prompt: "${prompt}"`;
}
