/**
 * This module provides an implementation for interfacing with the
 * "LM Studio" service API using the @lmstudio/sdk.
 */
import { LMStudioClient } from '@lmstudio/sdk';
import { getSelectedModel } from '../context/ModeContext.js';

export async function sendLmStudioRequest(prompt: string): Promise<string> {
  const client = new LMStudioClient();
  const model = await client.llm.model(getSelectedModel());
  const result = await model.respond(prompt);
  return result.content;
}

export async function listModels(): Promise<string[]> {
  const client = new LMStudioClient();
  const models = await client.system.listDownloadedModels();
  return models.map((m: { modelKey: string }) => m.modelKey);
}
