import { SlashCommand } from '../hooks/useCommand.js';
import {
  setpreferredProvider,
  getAvailableProviders,
  getpreferredProvider,
  ApiProviderEnum,
  getModelManagerForProvider
} from '../api/apiProvider.js';

export enum SlashCommands {
  HELP = 'help',
  CLEAR = 'clear',
  PROVIDERS = 'providers',
  SETPROVIDER = 'setprovider',
  CURRENTPROVIDER = 'currentprovider',
  LISTMODELS = 'listmodels',
  SETMODEL = 'setmodel',
  CURRENTMODEL = 'currentmodel',
  EXIT = 'exit'
}

export const ValidCommands: string[] = [
  SlashCommands.HELP,
  SlashCommands.EXIT,
  SlashCommands.CLEAR,
  SlashCommands.SETPROVIDER,
  SlashCommands.PROVIDERS,
  SlashCommands.CURRENTPROVIDER
];

/**
 * Controller for managing slash commands and their interactions with the UI
 */
export class CommandController {
  private commands: SlashCommand[] = [];
  private onOutputCallback: (output: string[]) => void;
  private onClearCallback: () => void;

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
    } = {}
  ) {
    this.commands = options.commands || [];
    this.onOutputCallback = options.onOutput || (() => {});
    this.onClearCallback = options.onClear || (() => {});

    // Register built-in commands
    this.registerBuiltInCommands();
  }

  /**
   * Register a new command
   */
  registerCommand(command: SlashCommand): void {
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
   */
  registerCommands(commands: SlashCommand[]): void {
    commands.forEach((command) => this.registerCommand(command));
  }

  /**
   * Process a command string
   * Returns true if a command was executed, false otherwise
   */
  processCommand(input: string): boolean {
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
   * Register built-in commands like help, clear, exit
   */
  private registerBuiltInCommands(): void {
    // Help command
    this.registerCommand({
      name: 'help',
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
      name: 'clear',
      description: 'Clear the terminal',
      handler: () => {
        this.clearTerminal();
      }
    });

    // Provider commands
    this.registerCommand({
      name: 'providers',
      description: 'List available API providers',
      handler: () => {
        const providers = getAvailableProviders();
        this.showOutput(['Available API providers:'].concat(providers));
      }
    });

    this.registerCommand({
      name: 'setprovider',
      description:
        'Set the preferred API provider. Usage: /setprovider providerName',
      handler: (args: string) => {
        const providers = getAvailableProviders();
        const inputProvider = args.toLowerCase() as ApiProviderEnum;
        if (providers.includes(inputProvider)) {
          setpreferredProvider(inputProvider);
          this.showOutput([`Preferred provider set to ${inputProvider}`]);
        } else {
          this.showOutput([
            `Invalid provider: ${args}. Available: ${providers.join(', ')}`
          ]);
        }
      }
    });

    this.registerCommand({
      name: 'currentprovider',
      description: 'Show the current API provider',
      handler: () => {
        const current = getpreferredProvider();
        this.showOutput([`Current provider: ${current}`]);
      }
    });

    // Model management commands abstracted for the current API provider
    this.registerCommand({
      name: 'listmodels',
      description: 'List available models for the current API provider',
      handler: (_args: string) => {
        const provider = getpreferredProvider();
        const modelManager = getModelManagerForProvider(provider);
        if (modelManager && typeof modelManager.listModels === 'function') {
          modelManager
            .listModels()
            .then((models: string[]) => {
              this.showOutput(['Available models:'].concat(models));
            })
            .catch((error: Error) => {
              this.showOutput([`Error retrieving models: ${error.message}`]);
            });
        } else {
          this.showOutput([
            `The current provider (${provider}) does not support model management.`
          ]);
        }
      }
    });

    this.registerCommand({
      name: 'setmodel',
      description:
        'Set the current model for the current API provider. Usage: /setmodel modelKey',
      handler: (_args: string) => {
        if (!_args) {
          this.showOutput(['Model key is required. Usage: /setmodel modelKey']);
          return;
        }
        const provider = getpreferredProvider();
        const modelManager = getModelManagerForProvider(provider);
        if (
          modelManager &&
          typeof modelManager.setCurrentModel === 'function'
        ) {
          modelManager.setCurrentModel(_args);
          this.showOutput([
            `Current model set to ${_args} for provider ${provider}`
          ]);
        } else {
          this.showOutput([
            `The current provider (${provider}) does not support model management.`
          ]);
        }
      }
    });

    this.registerCommand({
      name: SlashCommands.CURRENTMODEL,
      description: 'Show the current model for the current API provider',
      handler: () => {
        const provider = getpreferredProvider();
        const modelManager = getModelManagerForProvider(provider);
        if (
          modelManager &&
          typeof modelManager.getCurrentModel === 'function'
        ) {
          const current = modelManager.getCurrentModel();
          this.showOutput([
            `Current model for provider ${provider}: ${current}`
          ]);
        } else {
          this.showOutput([
            `The current provider (${provider}) does not support model management.`
          ]);
        }
      }
    });

    // Exit command
    this.registerCommand({
      name: 'exit',
      description: 'Exit the application',
      handler: () => {
        this.showOutput(['Exiting application...']);
        setTimeout(() => process.exit(0), 100);
      }
    });
  }
}
