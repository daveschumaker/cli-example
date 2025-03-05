import { sendOllamaRequest } from './ollama.js';

export async function sendApiRequest(prompt: string): Promise<string> {
  // Proxy function for active API; defaulting to Ollama for now.
  return sendOllamaRequest(prompt);
}
