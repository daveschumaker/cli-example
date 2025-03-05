import { useCallback } from 'react';
import { SlashCommands } from '../utils/constants.js';

export type CommandHandler = (args: string) => void;

export interface SlashCommand {
  name: SlashCommands | string; // Allow string for backward compatibility, but prefer SlashCommands
  description: string;
  handler: CommandHandler;
}

/**
 * Hook for managing slash commands in a CLI interface
 */
export function useCommand(commands: SlashCommand[] = []) {
  /**
   * Process input text to check if it's a slash command
   * Returns true if a command was executed, false otherwise
   */
  const processCommand = useCallback(
    (text: string): boolean => {
      // Check if the input starts with a slash
      if (!text.trim().startsWith('/')) {
        return false;
      }

      // Extract command name and arguments
      const trimmedText = text.trim();
      const spaceIndex = trimmedText.indexOf(' ');

      let commandName: string;
      let args: string = '';

      if (spaceIndex === -1) {
        // No arguments provided
        commandName = trimmedText.slice(1);
      } else {
        // Extract command name and arguments
        commandName = trimmedText.slice(1, spaceIndex);
        args = trimmedText.slice(spaceIndex + 1).trim();
      }

      // Find and execute the command
      const command = commands.find((cmd) => cmd.name === commandName);
      if (command) {
        command.handler(args);
        return true;
      }

      return false;
    },
    [commands]
  );

  /**
   * Get list of available commands
   */
  const getAvailableCommands = useCallback(() => {
    return commands.map((cmd) => ({
      name: cmd.name,
      description: cmd.description
    }));
  }, [commands]);

  return {
    processCommand,
    getAvailableCommands
  };
}

/**
 * Default slash commands that can be used in any application
 */
export const defaultCommands: SlashCommand[] = [
  {
    name: SlashCommands.EXIT,
    description: 'Exit the application',
    handler: () => {
      console.log('Exiting application...');
      process.exit(0);
    }
  },
  {
    name: SlashCommands.HELP,
    description: 'Show available commands',
    // @ts-ignore
    handler: (args: string) => {
      // This is a placeholder. The actual implementation will be in TextInput.tsx
      console.log('Showing help');
    }
  },
  {
    name: SlashCommands.CLEAR,
    description: 'Clear the terminal',
    handler: () => {
      // This is a placeholder. The actual implementation will be in TextInput.tsx
      console.log('Clearing terminal');
    }
  }
];
