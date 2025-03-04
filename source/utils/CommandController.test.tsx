import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest';
import { CommandController } from './CommandController.js';
import { SlashCommand } from '../hooks/useCommand.js';

describe('CommandController', () => {
  let controller: CommandController;
  let mockOutput: Mock;
  let mockClear: Mock;

  beforeEach(() => {
    mockOutput = vi.fn();
    mockClear = vi.fn();
    controller = new CommandController({
      onOutput: mockOutput,
      onClear: mockClear
    });
  });

  test('should register and process custom commands', () => {
    const mockHandler = vi.fn();
    const customCommand: SlashCommand = {
      name: 'custom',
      description: 'A custom command',
      handler: mockHandler
    };

    controller.registerCommand(customCommand);

    // Process the command
    const result = controller.processCommand('/custom arg1 arg2');

    expect(result).toBe(true);
    expect(mockHandler).toHaveBeenCalledWith('arg1 arg2');
  });

  test('should handle commands without arguments', () => {
    const mockHandler = vi.fn();
    controller.registerCommand({
      name: 'noargs',
      description: 'Command with no args',
      handler: mockHandler
    });

    controller.processCommand('/noargs');

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

  test('should have built-in help command', () => {
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
    expect(commands.some((cmd) => cmd.name === 'help')).toBe(true);
    expect(commands.some((cmd) => cmd.name === 'clear')).toBe(true);
    expect(commands.some((cmd) => cmd.name === 'exit')).toBe(true);
  });

  test('should register multiple commands at once', () => {
    const mockHandler1 = vi.fn();
    const mockHandler2 = vi.fn();

    controller.registerCommands([
      {
        name: 'cmd1',
        description: 'Command 1',
        handler: mockHandler1
      },
      {
        name: 'cmd2',
        description: 'Command 2',
        handler: mockHandler2
      }
    ]);

    controller.processCommand('/cmd1 args1');
    controller.processCommand('/cmd2 args2');

    expect(mockHandler1).toHaveBeenCalledWith('args1');
    expect(mockHandler2).toHaveBeenCalledWith('args2');
  });

  test('should replace existing command when registering with same name', () => {
    const mockHandler1 = vi.fn();
    const mockHandler2 = vi.fn();

    controller.registerCommand({
      name: 'same',
      description: 'Original command',
      handler: mockHandler1
    });

    controller.registerCommand({
      name: 'same',
      description: 'Replacement command',
      handler: mockHandler2
    });

    controller.processCommand('/same args');

    expect(mockHandler1).not.toHaveBeenCalled();
    expect(mockHandler2).toHaveBeenCalledWith('args');
  });
});
