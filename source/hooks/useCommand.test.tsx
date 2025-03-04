import { describe, test, expect, vi } from 'vitest';
import {
  useCommand,
  defaultCommands,
  type SlashCommand
} from './useCommand.js';

// Mock React's useCallback to just return the callback function
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: (callback: any) => callback
  };
});

describe('useCommand hook', () => {
  test('processCommand returns false for regular text input', () => {
    const { processCommand } = useCommand();
    expect(processCommand('regular text')).toBe(false);
  });

  test('processCommand returns false when command not found', () => {
    const { processCommand } = useCommand();
    expect(processCommand('/nonexistent')).toBe(false);
  });

  test('processCommand calls handler when command is found', () => {
    const mockHandler = vi.fn();
    const testCommand: SlashCommand = {
      name: 'test',
      description: 'Test command',
      handler: mockHandler
    };

    const { processCommand } = useCommand([testCommand]);

    expect(processCommand('/test')).toBe(true);
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith('');
  });

  test('processCommand passes arguments to handler', () => {
    const mockHandler = vi.fn();
    const testCommand: SlashCommand = {
      name: 'test',
      description: 'Test command',
      handler: mockHandler
    };

    const { processCommand } = useCommand([testCommand]);

    expect(processCommand('/test arg1 arg2')).toBe(true);
    expect(mockHandler).toHaveBeenCalledWith('arg1 arg2');
  });

  test('processCommand works with multiple commands', () => {
    const mockHandler1 = vi.fn();
    const mockHandler2 = vi.fn();

    const commands: SlashCommand[] = [
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
    ];

    const { processCommand } = useCommand(commands);

    expect(processCommand('/cmd1')).toBe(true);
    expect(mockHandler1).toHaveBeenCalledTimes(1);
    expect(mockHandler2).not.toHaveBeenCalled();

    mockHandler1.mockClear();
    mockHandler2.mockClear();

    expect(processCommand('/cmd2 some args')).toBe(true);
    expect(mockHandler1).not.toHaveBeenCalled();
    expect(mockHandler2).toHaveBeenCalledWith('some args');
  });

  test('getAvailableCommands returns list of commands', () => {
    const commands: SlashCommand[] = [
      {
        name: 'cmd1',
        description: 'Command 1',
        handler: () => {}
      },
      {
        name: 'cmd2',
        description: 'Command 2',
        handler: () => {}
      }
    ];

    const { getAvailableCommands } = useCommand(commands);

    expect(getAvailableCommands()).toEqual([
      { name: 'cmd1', description: 'Command 1' },
      { name: 'cmd2', description: 'Command 2' }
    ]);
  });

  test('defaultCommands includes help, exit, and clear', () => {
    const commandNames = defaultCommands.map((cmd) => cmd.name);
    expect(commandNames).toContain('help');
    expect(commandNames).toContain('exit');
    expect(commandNames).toContain('clear');
  });
});
