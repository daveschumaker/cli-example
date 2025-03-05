import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest';
import { CommandController } from './CommandController.js';
import { SlashCommand } from '../hooks/useCommand.js';
import * as apiProvider from '../api/apiProvider.js';
import { ApiProviderEnum } from '../api/apiProvider.js';
import { SlashCommands } from './constants.js';

describe('CommandController', () => {
  let controller: CommandController;
  let mockOutput: Mock;
  let mockClear: Mock;
  
  // Common setup before each test
  beforeEach(() => {
    mockOutput = vi.fn();
    mockClear = vi.fn();
    controller = new CommandController({
      onOutput: mockOutput,
      onClear: mockClear
    });
  });
  
  // Reset all mocks after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Command Registration and Processing', () => {
    test('should register and process custom commands', () => {
      const mockHandler = vi.fn();
      const customCommand: SlashCommand = {
        name: SlashCommands.HELP, // Using an existing SlashCommands enum value
        description: 'A custom help command',
        handler: mockHandler
      };
  
      controller.registerCommand(customCommand);
  
      // Process the command
      const result = controller.processCommand('/help arg1 arg2');
  
      expect(result).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith('arg1 arg2');
    });
  
    test('should handle commands without arguments', () => {
      const mockHandler = vi.fn();
      controller.registerCommand({
        name: SlashCommands.CLEAR, // Using an existing SlashCommands enum value
        description: 'Command with no args',
        handler: mockHandler
      });
  
      controller.processCommand('/clear');
  
      expect(mockHandler).toHaveBeenCalledWith('');
    });
  
    test('should not process regular text', () => {
      const result = controller.processCommand('regular text');
      expect(result).toBe(false);
    });
  
    test('should show error for unknown commands', () => {
      const result = controller.processCommand('/unknown');
  
      expect(result).toBe(false);
      expect(mockOutput).toHaveBeenCalledWith([
        'Command not found: /unknown. Type /help to see available commands.'
      ]);
    });

    test('should throw an error when registering an invalid command name', () => {
      const mockHandler = vi.fn();
      
      expect(() => {
        controller.registerCommand({
          name: 'invalid_command' as any, // Using a name not in SlashCommands enum
          description: 'This should fail',
          handler: mockHandler
        });
      }).toThrow(/Invalid command name/);
    });
    
    test('should register multiple commands at once', () => {
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();
  
      controller.registerCommands([
        {
          name: SlashCommands.PROVIDERS,
          description: 'Command 1',
          handler: mockHandler1
        },
        {
          name: SlashCommands.SETPROVIDER,
          description: 'Command 2',
          handler: mockHandler2
        }
      ]);
  
      controller.processCommand('/providers args1');
      controller.processCommand('/setprovider args2');
  
      expect(mockHandler1).toHaveBeenCalledWith('args1');
      expect(mockHandler2).toHaveBeenCalledWith('args2');
    });
  
    test('should replace existing command when registering with same name', () => {
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();
  
      controller.registerCommand({
        name: SlashCommands.CURRENTPROVIDER,
        description: 'Original command',
        handler: mockHandler1
      });
  
      controller.registerCommand({
        name: SlashCommands.CURRENTPROVIDER,
        description: 'Replacement command',
        handler: mockHandler2
      });
  
      controller.processCommand('/currentprovider args');
  
      expect(mockHandler1).not.toHaveBeenCalled();
      expect(mockHandler2).toHaveBeenCalledWith('args');
    });
  });
  
  describe('Built-in Commands', () => {
    test('should have built-in help command that lists all commands', () => {
      controller.processCommand('/help');
  
      // Help should show available commands
      expect(mockOutput).toHaveBeenCalled();
      const call = mockOutput.mock.calls[0];
      if (call && call[0]) {
        const output = call[0] as string[];
  
        // Should include at least help, clear, and exit commands
        expect(output.some((line: string) => line.includes('/help'))).toBe(true);
        expect(output.some((line: string) => line.includes('/clear'))).toBe(true);
        expect(output.some((line: string) => line.includes('/exit'))).toBe(true);
      }
    });
  
    test('should have built-in clear command', () => {
      controller.processCommand('/clear');
  
      expect(mockClear).toHaveBeenCalled();
    });
  
    test('should return list of available commands', () => {
      const commands = controller.getAvailableCommands();
  
      // Should include at least the built-in commands
      expect(commands.some((cmd) => cmd.name === SlashCommands.HELP)).toBe(true);
      expect(commands.some((cmd) => cmd.name === SlashCommands.CLEAR)).toBe(true);
      expect(commands.some((cmd) => cmd.name === SlashCommands.EXIT)).toBe(true);
    });
  });

  describe('Provider Commands', () => {
    // Sample providers for testing
    const providersSample: ApiProviderEnum[] = [
      ApiProviderEnum.OPENAI,
      ApiProviderEnum.OLLAMA
    ];

    test('should list available API providers via /providers command', () => {
      // Spy on getAvailableProviders to return our sample
      const getAvailSpy = vi
        .spyOn(apiProvider, 'getAvailableProviders')
        .mockReturnValue(providersSample);
  
      controller.processCommand('/providers');
  
      expect(getAvailSpy).toHaveBeenCalled();
      expect(mockOutput).toHaveBeenCalledWith(
        ['Available API providers:'].concat(providersSample)
      );
    });
  
    test('should set valid provider via /setprovider command', () => {
      vi.spyOn(apiProvider, 'getAvailableProviders').mockReturnValue(
        providersSample
      );
      const setProviderSpy = vi
        .spyOn(apiProvider, 'setpreferredProvider')
        .mockImplementation(() => {});
  
      controller.processCommand(`/setprovider ${ApiProviderEnum.OPENAI}`);
  
      expect(setProviderSpy).toHaveBeenCalledWith(ApiProviderEnum.OPENAI);
      expect(mockOutput).toHaveBeenCalledWith([
        `Preferred provider set to ${ApiProviderEnum.OPENAI}`
      ]);
    });
  
    test('should show error for invalid provider in /setprovider command', () => {
      vi.spyOn(apiProvider, 'getAvailableProviders').mockReturnValue(
        providersSample
      );
      const setProviderSpy = vi.spyOn(apiProvider, 'setpreferredProvider');
  
      controller.processCommand('/setprovider invalidProvider');
  
      expect(setProviderSpy).not.toHaveBeenCalled();
      expect(mockOutput).toHaveBeenCalledWith([
        'Invalid provider: invalidProvider. Available: ' +
          providersSample.join(', ')
      ]);
    });
  
    test('should show current provider via /currentprovider command', () => {
      const currentProvider: ApiProviderEnum = ApiProviderEnum.OPENAI;
      vi.spyOn(apiProvider, 'getpreferredProvider').mockReturnValue(
        currentProvider
      );
  
      controller.processCommand('/currentprovider');
  
      expect(mockOutput).toHaveBeenCalledWith([
        `Current provider: ${currentProvider}`
      ]);
    });
    
    test('should handle case insensitivity in provider names', () => {
      vi.spyOn(apiProvider, 'getAvailableProviders').mockReturnValue(
        providersSample
      );
      const setProviderSpy = vi
        .spyOn(apiProvider, 'setpreferredProvider')
        .mockImplementation(() => {});
  
      // Use uppercase in command
      controller.processCommand(`/setprovider ${ApiProviderEnum.OPENAI.toUpperCase()}`);
  
      expect(setProviderSpy).toHaveBeenCalledWith(ApiProviderEnum.OPENAI);
      expect(mockOutput).toHaveBeenCalledWith([
        `Preferred provider set to ${ApiProviderEnum.OPENAI}`
      ]);
    });
  });

  describe('Model Management Commands', () => {
    const models = ['model1', 'model2'];
    const currentModel = 'model1';
    
    // Setup mocks for model management
    beforeEach(() => {
      // Mock the provider
      vi.spyOn(apiProvider, 'getpreferredProvider').mockReturnValue(ApiProviderEnum.OPENAI);
      
      // Mock the model manager with Promise implementation
      const mockModelManager = {
        listModels: vi.fn().mockImplementation(() => Promise.resolve(models)),
        setCurrentModel: vi.fn(),
        getCurrentModel: vi.fn().mockReturnValue(currentModel)
      };
      
      vi.spyOn(apiProvider, 'getModelManagerForProvider').mockReturnValue(mockModelManager);
    });
    
    test('should list available models via /listmodels command', async () => {
      // Set up a promise to catch the async call
      let resolveCallback: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolveCallback = resolve;
      });
      
      // Override the showOutput method to resolve our promise when called
      const originalShowOutput = controller.showOutput;
      vi.spyOn(controller, 'showOutput').mockImplementation((output) => {
        originalShowOutput.call(controller, output);
        resolveCallback(output);
      });
      
      // Execute the command
      controller.processCommand('/listmodels');
      
      // Wait for the async call to complete
      await promise;
      
      // Verify the output
      expect(mockOutput).toHaveBeenCalledWith(['Available models:'].concat(models));
    });
    
    test('should set current model via /setmodel command', () => {
      const modelToSet = 'gpt-4';
      controller.processCommand(`/setmodel ${modelToSet}`);
      
      const modelManager = apiProvider.getModelManagerForProvider(ApiProviderEnum.OPENAI);
      expect(modelManager?.setCurrentModel).toHaveBeenCalledWith(modelToSet);
      expect(mockOutput).toHaveBeenCalledWith([
        `Current model set to ${modelToSet} for provider ${ApiProviderEnum.OPENAI}`
      ]);
    });
    
    test('should show error for empty model name in /setmodel command', () => {
      controller.processCommand('/setmodel');
      
      const modelManager = apiProvider.getModelManagerForProvider(ApiProviderEnum.OPENAI);
      expect(modelManager?.setCurrentModel).not.toHaveBeenCalled();
      expect(mockOutput).toHaveBeenCalledWith(['Model key is required. Usage: /setmodel modelKey']);
    });
    
    test('should show current model via /currentmodel command', () => {
      controller.processCommand('/currentmodel');
      
      const modelManager = apiProvider.getModelManagerForProvider(ApiProviderEnum.OPENAI);
      expect(modelManager?.getCurrentModel).toHaveBeenCalled();
      expect(mockOutput).toHaveBeenCalledWith([
        `Current model for provider ${ApiProviderEnum.OPENAI}: ${currentModel}`
      ]);
    });
    
    test('should show error when provider does not support model management', () => {
      // Override the mock to return null (provider doesn't support model management)
      vi.spyOn(apiProvider, 'getModelManagerForProvider').mockReturnValue(null);
      
      controller.processCommand('/listmodels');
      
      expect(mockOutput).toHaveBeenCalledWith([
        `The current provider (${ApiProviderEnum.OPENAI}) does not support model management.`
      ]);
    });
  });
  
  describe('Exit Command', () => {
    test('should exit application via /exit command', () => {
      // Prevent actual process exit
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_: any) => {
        return undefined as never;
      });
      // Use fake timers to trigger the timeout
      vi.useFakeTimers();
  
      controller.processCommand('/exit');
  
      expect(mockOutput).toHaveBeenCalledWith(['Exiting application...']);
  
      // Fast-forward timer by 101ms to ensure setTimeout handler runs
      vi.advanceTimersByTime(101);
      expect(exitSpy).toHaveBeenCalledWith(0);
  
      // Cleanup fake timers
      vi.useRealTimers();
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle empty command input', () => {
      const result = controller.processCommand('/');
      
      expect(result).toBe(false);
      expect(mockOutput).toHaveBeenCalledWith([
        'Command not found: /. Type /help to see available commands.'
      ]);
    });
    
    test('should handle commands with special characters in arguments', () => {
      const mockHandler = vi.fn();
      controller.registerCommand({
        name: SlashCommands.HELP,
        description: 'Custom help command',
        handler: mockHandler
      });
      
      controller.processCommand('/help arg "quoted text" --flag=value');
      
      expect(mockHandler).toHaveBeenCalledWith('arg "quoted text" --flag=value');
    });
    
    test('should handle whitespace after slash', () => {
      const result = controller.processCommand('/    ');
      
      expect(result).toBe(false);
      expect(mockOutput).toHaveBeenCalledWith([
        'Command not found: /. Type /help to see available commands.'
      ]);
    });
    
    test('should handle very long command arguments', () => {
      const mockHandler = vi.fn();
      controller.registerCommand({
        name: SlashCommands.HELP,
        description: 'Custom help command',
        handler: mockHandler
      });
      
      // Create a very long argument string (1000 characters)
      const longArg = 'a'.repeat(1000);
      controller.processCommand(`/help ${longArg}`);
      
      expect(mockHandler).toHaveBeenCalledWith(longArg);
    });
    
    test('should handle non-string command inputs gracefully', () => {
      // @ts-expect-error - Testing invalid input type
      const result = controller.processCommand(null);
      
      expect(result).toBe(false);
      
      // @ts-expect-error - Testing invalid input type
      const result2 = controller.processCommand(undefined);
      
      expect(result2).toBe(false);
    });
  });
});
