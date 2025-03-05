import { describe, it, beforeEach, vi, expect } from 'vitest';
import {
  ApiProviderEnum,
  getpreferredProvider,
  setpreferredProvider,
  getAvailableProviders,
  sendApiRequest
} from './apiProvider.js';
import * as ollama from './ollama.js';
import * as claude from './claude.js';
import * as lmstudio from './lmstudio.js';
import * as openai from './openai.js';

describe('apiProvider', () => {
  beforeEach(() => {
    // Reset to default provider (OLLAMA)
    setpreferredProvider(ApiProviderEnum.OLLAMA);
  });

  it('returns OLLAMA as the default provider', () => {
    expect(getpreferredProvider()).toBe(ApiProviderEnum.OLLAMA);
  });

  it('updates the provider using setpreferredProvider', () => {
    setpreferredProvider(ApiProviderEnum.CLAUDE);
    expect(getpreferredProvider()).toBe(ApiProviderEnum.CLAUDE);
  });

  it('returns all available providers', () => {
    expect(getAvailableProviders()).toEqual([
      ApiProviderEnum.CLAUDE,
      ApiProviderEnum.LM_STUDIO,
      ApiProviderEnum.OLLAMA,
      ApiProviderEnum.OPENAI
    ]);
  });

  describe('sendApiRequest', () => {
    const prompt = 'test prompt';

    it('calls sendOllamaRequest by default', async () => {
      const ollamaMock = vi
        .spyOn(ollama, 'sendOllamaRequest')
        .mockResolvedValue('ollama response');
      const response = await sendApiRequest(prompt);
      expect(response).toBe('ollama response');
      expect(ollamaMock).toHaveBeenCalledWith(prompt);
      ollamaMock.mockRestore();
    });

    it('calls sendClaudeRequest when provider is CLAUDE', async () => {
      setpreferredProvider(ApiProviderEnum.CLAUDE);
      const claudeMock = vi
        .spyOn(claude, 'sendClaudeRequest')
        .mockResolvedValue('claude response');
      const response = await sendApiRequest(prompt);
      expect(response).toBe('claude response');
      expect(claudeMock).toHaveBeenCalledWith(prompt);
      claudeMock.mockRestore();
    });

    it('calls sendLmStudioRequest when provider is LM_STUDIO', async () => {
      setpreferredProvider(ApiProviderEnum.LM_STUDIO);
      const lmstudioMock = vi
        .spyOn(lmstudio, 'sendLmStudioRequest')
        .mockResolvedValue('lmstudio response');
      const response = await sendApiRequest(prompt);
      expect(response).toBe('lmstudio response');
      expect(lmstudioMock).toHaveBeenCalledWith(prompt);
      lmstudioMock.mockRestore();
    });

    it('calls sendOpenAiRequest when provider is OPENAI', async () => {
      setpreferredProvider(ApiProviderEnum.OPENAI);
      const openaiMock = vi
        .spyOn(openai, 'sendOpenAiRequest')
        .mockResolvedValue('openai response');
      const response = await sendApiRequest(prompt);
      expect(response).toBe('openai response');
      expect(openaiMock).toHaveBeenCalledWith(prompt);
      openaiMock.mockRestore();
    });
  });
});
