import { sendOllamaRequest } from './ollama.js';
import { sendClaudeRequest } from './claude.js';
import { sendLmStudioRequest, listModels } from './lmstudio.js';
import { sendOpenAiRequest } from './openai.js';

export const lmStudioManager = {
  sendRequest: sendLmStudioRequest,
  listModels
};

export enum ApiProviderEnum {
  CLAUDE = 'claude',
  LM_STUDIO = 'lmstudio',
  OLLAMA = 'ollama',
  OPENAI = 'openai'
}

let preferredProvider: ApiProviderEnum = ApiProviderEnum.LM_STUDIO;

export function setpreferredProvider(provider: ApiProviderEnum): void {
  preferredProvider = provider;
}

export function getpreferredProvider(): ApiProviderEnum {
  return preferredProvider;
}

export function getAvailableProviders(): ApiProviderEnum[] {
  return Object.values(ApiProviderEnum);
}

export function getModelManagerForProvider(provider: ApiProviderEnum) {
  switch (provider) {
    case ApiProviderEnum.LM_STUDIO:
      return lmStudioManager;
    default:
      return null;
  }
}
export async function sendApiRequest(
  prompt: string,
  conversationContext?: string
): Promise<string> {
  switch (preferredProvider) {
    case ApiProviderEnum.CLAUDE:
      return sendClaudeRequest(prompt);
    case ApiProviderEnum.LM_STUDIO:
      return conversationContext === undefined
        ? sendLmStudioRequest(prompt)
        : sendLmStudioRequest(prompt, conversationContext);
    case ApiProviderEnum.OPENAI:
      return sendOpenAiRequest(prompt);
    case ApiProviderEnum.OLLAMA:
    default:
      return sendOllamaRequest(prompt);
  }
}
