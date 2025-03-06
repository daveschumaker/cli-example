import { SlashCommand } from '../hooks/useCommand.js';
import {
  setpreferredProvider,
  getAvailableProviders,
  getpreferredProvider,
  getModelManagerForProvider,
  ApiProviderEnum
} from '../api/apiProvider.js';
import { SlashCommands } from './constants.js';
import { Mode, getSelectedModel } from '../context/ModeContext.js';

/**
 * Controller for managing slash commands and their interactions with the UI
 */
export class CommandController {
  private commands: SlashCommand[] = [];
  private onOutputCallback: (output: string[]) => void;
  private onClearCallback: () => void;
  private onModeChange?: (newMode: Mode) => void;
  private onModelChange?: (newModel: string) => void;
  private onProviderChange?: (newProvider: string) => void;

  /**
   * Create a new CommandController
   *
   * @param options Configuration options
   */
  constructor(
    options: {
      commands?: SlashCommand[];
      onOutput?: (output: string[]) => void;
      onClear?: () => void;
      onModeChange?: (newMode: Mode) => void;
      onModelChange?: (newModel: string) => void;
      onProviderChange?: (newProvider: string) => void;
    } = {}
  ) {
    this.commands = options.commands || [];
    this.onOutputCallback = options.onOutput || (() => {});
    this.onClearCallback = options.onClear || (() => {});
    this.onModeChange = options.onModeChange;
    this.onModelChange = options.onModelChange;
    this.onProviderChange = options.onProviderChange;
    // Register built-in commands
    this.registerBuiltInCommands();
  }

  /**
   * Register a new command
   * @throws Error if the command name is not in the SlashCommands enum
   */
  registerCommand(command: SlashCommand): void {
    // Ensure the command name is in the SlashCommands enum
    const commandValues = Object.values(SlashCommands);
    const isValidCommand = commandValues.includes(
      command.name as SlashCommands
    );

    if (!isValidCommand) {
      throw new Error(
        `Invalid command name: ${command.name}. Command name must be one of the SlashCommands enum values: ${commandValues.join(', ')}`
      );
    }

    // Replace command if it already exists
    const existingIndex = this.commands.findIndex(
      (cmd) => cmd.name === command.name
    );
    if (existingIndex >= 0) {
      this.commands[existingIndex] = command;
    } else {
      this.commands.push(command);
    }
  }

  /**
   * Register multiple commands at once
   * @throws Error if any command name is not in the SlashCommands enum
   */
  registerCommands(commands: SlashCommand[]): void {
    commands.forEach((command) => this.registerCommand(command));
  }

  /**
   * Process a command string
   * Returns true if a command was executed, false otherwise
   */
  processCommand(input: string): boolean {
    // Handle null/undefined input gracefully
    if (!input) {
      return false;
    }

    // Check if the input starts with a slash
    if (!input.trim().startsWith('/')) {
      return false;
    }

    // Extract command name and arguments
    const trimmedInput = input.trim();
    const spaceIndex = trimmedInput.indexOf(' ');

    let commandName: string;
    let args: string = '';

    if (spaceIndex === -1) {
      // No arguments provided
      commandName = trimmedInput.slice(1);
    } else {
      // Extract command name and arguments
      commandName = trimmedInput.slice(1, spaceIndex);
      args = trimmedInput.slice(spaceIndex + 1).trim();
    }

    // Find the command
    const command = this.commands.find((cmd) => cmd.name === commandName);
    if (command) {
      command.handler(args);
      return true;
    }

    // Command not found, show error message
    this.showOutput([
      `Command not found: /${commandName}. Type /help to see available commands.`
    ]);
    return false;
  }

  /**
   * Get all available commands
   */
  getAvailableCommands(): Array<{ name: string; description: string }> {
    return this.commands.map((cmd) => ({
      name: cmd.name,
      description: cmd.description
    }));
  }

  /**
   * Show output in the terminal
   */
  showOutput(output: string[]): void {
    this.onOutputCallback(output);
  }

  /**
   * Clear the terminal
   */
  clearTerminal(): void {
    this.onClearCallback();
  }

  /**
   * Register built-in commands like help, clear, exit, and setmode.
   */
  private registerBuiltInCommands(): void {
    // Help command
    this.registerCommand({
      name: SlashCommands.HELP,
      description: 'Show available commands',
      handler: () => {
        const commandsList = this.getAvailableCommands().map(
          (cmd) => `/${cmd.name} - ${cmd.description}`
        );
        this.showOutput(['Available commands:'].concat(commandsList));
      }
    });

    // Clear command
    this.registerCommand({
      name: SlashCommands.CLEAR,
      description: 'Clear the terminal',
      handler: () => {
        this.clearTerminal();
      }
    });

    // Provider commands
    this.registerCommand({
      name: SlashCommands.PROVIDERS,
      description: 'List available API providers',
      handler: () => {
        const providers = getAvailableProviders();
        this.showOutput(['Available API providers:'].concat(providers));
      }
    });

    this.registerCommand({
      name: SlashCommands.SETPROVIDER,
      description:
        'Set the preferred API provider. Usage: /setprovider providerName',
      handler: (args: string) => {
        const providers = getAvailableProviders();
        const inputProvider = args.toLowerCase() as ApiProviderEnum;
        if (providers.includes(inputProvider)) {
          setpreferredProvider(inputProvider);
          
          // Update the ModeContext via callback
          if (this.onProviderChange) {
            this.onProviderChange(inputProvider);
          }
          
          this.showOutput([`Preferred provider set to ${inputProvider}`]);
        } else {
          this.showOutput([
            `Invalid provider: ${args}. Available: ${providers.join(', ')}`
          ]);
        }
      }
    });

    this.registerCommand({
      name: SlashCommands.CURRENTPROVIDER,
      description: 'Show the current API provider',
      handler: () => {
        const current = getpreferredProvider();
        this.showOutput([`Current provider: ${current}`]);
      }
    });

    // Model management commands
    this.registerCommand({
      name: SlashCommands.LISTMODELS,
      description: 'List available models for the current provider',
      handler: async () => {
        const currentProvider = getpreferredProvider();
        const modelManager = getModelManagerForProvider(currentProvider);
        
        if (!modelManager) {
          this.showOutput([
            `The current provider (${currentProvider}) does not support model management.`
          ]);
          return;
        }
        
        try {
          const models = await modelManager.listModels();
          this.showOutput(['Available models:'].concat(models));
        } catch (error) {
          this.showOutput([`Error listing models: ${error}`]);
        }
      }
    });

    // Model management commands using context
    this.registerCommand({
      name: SlashCommands.SETMODEL,
      description: 'Set the current model. Usage: /setmodel modelKey',
      handler: (_args: string) => {
        if (!_args) {
          this.showOutput(['Model key is required. Usage: /setmodel modelKey']);
          return;
        }
        if (this.onModelChange) {
          this.onModelChange(_args);
          this.showOutput([`Current model set to ${_args}`]);
        } else {
          this.showOutput(['Model update callback not provided.']);
        }
      }
    });

    this.registerCommand({
      name: SlashCommands.CURRENTMODEL,
      description: 'Show the current model',
      handler: () => {
        const current = getSelectedModel();
        this.showOutput([`Current model: ${current || 'none'}`]);
      }
    });

    // Set mode command
    this.registerCommand({
      name: SlashCommands.SETMODE,
      description:
        'Change the application mode. Usage: /setmode [architect|chat|code]',
      handler: (args: string) => {
        if (!args) {
          this.showOutput([
            'Please specify a mode. Available modes: architect, chat, code'
          ]);
          return;
        }
        const modeArg = args.toLowerCase();
        if (
          modeArg !== 'architect' &&
          modeArg !== 'chat' &&
          modeArg !== 'code'
        ) {
          this.showOutput([
            `Invalid mode: ${args}. Available modes: architect, chat, code`
          ]);
          return;
        }
        if (this.onModeChange) {
          this.onModeChange(modeArg as Mode);
        }
        this.showOutput([`Application mode changed to ${modeArg}`]);
      }
    });

    // Exit command
    this.registerCommand({
      name: SlashCommands.EXIT,
      description: 'Exit the application',
      handler: () => {
        this.showOutput(['Exiting application...']);
        setTimeout(() => process.exit(0), 100);
      }
    });
  }
}
