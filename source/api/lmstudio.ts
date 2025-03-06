/**
 * This module provides an implementation for interfacing with the
 * "LM Studio" service API using the @lmstudio/sdk.
 */
import { LMStudioClient } from '@lmstudio/sdk';
import { getSelectedModel } from '../context/ModeContext.js';
import { Message } from '../context/ChatContext.js';

// Define the message format expected by LMStudio SDK
type LMStudioMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function sendLmStudioRequest(
  prompt: string,
  conversationContext?: Message[]
): Promise<string> {
  const client = new LMStudioClient();
  const model = await client.llm.model(getSelectedModel());

  // Convert our internal Message format to LMStudio message format
  const messages: LMStudioMessage[] =
    conversationContext && conversationContext.length > 0
      ? [
          ...conversationContext.map(({ role, content }) => ({
            // Ensure the role is one of the valid strings; fallback to 'user' if undefined
            role: role ?? 'user',
            content
          })),
          { role: 'user' as const, content: prompt }
        ]
      : [{ role: 'user' as const, content: prompt }];

  const result = await model.respond(messages);
  return result.content;
}

export async function listModels(): Promise<string[]> {
  const client = new LMStudioClient();
  const models = await client.system.listDownloadedModels();
  return models.map((m: { modelKey: string }) => m.modelKey);
}
