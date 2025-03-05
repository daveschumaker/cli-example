/**
 * This module provides an implementation for interfacing with the
 * "LM Studio" service API using the @lmstudio/sdk.
 */
import { LMStudioClient } from '@lmstudio/sdk';

export async function sendLmStudioRequest(prompt: string): Promise<string> {
  const client = new LMStudioClient();
  const model = await client.llm.model('qwq-32b');
  const result = await model.respond(prompt);
  return result.content;
}
