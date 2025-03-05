import { sendOllamaRequest } from './ollama.js';
import { sendClaudeRequest } from './claude.js';
import { sendLmStudioRequest } from './lmstudio.js';
import { sendOpenAiRequest } from './openai.js';

export enum ApiProviderEnum {
  CLAUDE = 'claude',
  LM_STUDIO = 'lmstudio',
  OLLAMA = 'ollama',
  OPENAI = 'openai'
}

let preferredProvider: ApiProviderEnum = ApiProviderEnum.OLLAMA;

export function setpreferredProvider(provider: ApiProviderEnum): void {
  preferredProvider = provider;
}

export function getpreferredProvider(): ApiProviderEnum {
  return preferredProvider;
}

export function getAvailableProviders(): ApiProviderEnum[] {
  return Object.values(ApiProviderEnum);
}

export async function sendApiRequest(prompt: string): Promise<string> {
  switch (preferredProvider) {
    case ApiProviderEnum.CLAUDE:
      return sendClaudeRequest(prompt);
    case ApiProviderEnum.LM_STUDIO:
      return sendLmStudioRequest(prompt);
    case ApiProviderEnum.OPENAI:
      return sendOpenAiRequest(prompt);
    case ApiProviderEnum.OLLAMA:
    default:
      return sendOllamaRequest(prompt);
  }
}
