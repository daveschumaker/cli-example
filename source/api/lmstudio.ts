/**
 * This module provides an implementation for interfacing with the
 * "LM Studio" service API using the @lmstudio/sdk.
 */
import { LMStudioClient } from '@lmstudio/sdk';

let currentModel: string = 'llama-3.2-3b-instruct';

export async function sendLmStudioRequest(prompt: string): Promise<string> {
  const client = new LMStudioClient();
  const model = await client.llm.model(currentModel);
  const result = await model.respond(prompt);
  return result.content;
}

export async function listModels(): Promise<string[]> {
  const client = new LMStudioClient();
  const models = await client.system.listDownloadedModels();
  return models.map((m: { modelKey: string }) => m.modelKey);
}

export function setCurrentModel(newModel: string): void {
  currentModel = newModel;
}

export function getCurrentModel(): string {
  return currentModel;
}
