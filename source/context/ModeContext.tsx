import React, { useState, createContext } from 'react';

interface ModeProviderProps {
  children: React.ReactNode;
}

export enum Mode {
  ARCHITECT = 'architect',
  CHAT = 'chat',
  CODE = 'code'
}

interface ModeContextType {
  mode: Mode;
  setCurrentMode: (mode: Mode) => void;
  preferredProvider: string;
  setPreferredProvider: (provider: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const ModeContext = createContext<ModeContextType>({
  mode: Mode.CHAT,
  setCurrentMode: (_mode: Mode) => {},
  preferredProvider: '',
  setPreferredProvider: (_provider: string) => {},
  selectedModel: '',
  setSelectedModel: (_model: string) => {}
});

/**
 * Global variables to hold the current state so that any utility can look them up.
 */
let currentMode = Mode.CHAT;
let currentPreferredProvider = 'lmstudio';
let currentSelectedModel = 'llama-3.2-3b-instruct';

export const getMode = (): Mode => {
  return currentMode;
};

export const getPreferredProvider = (): string => {
  return currentPreferredProvider;
};

export const getSelectedModel = (): string => {
  return currentSelectedModel;
};

export function ModeProvider({ children }: ModeProviderProps) {
  const [mode, setMode] = useState<Mode>(currentMode);
  const [preferredProvider, setPreferredProviderState] = useState<string>(
    currentPreferredProvider
  );
  const [selectedModel, setSelectedModelState] =
    useState<string>(currentSelectedModel);

  const setCurrentMode = (mode: Mode) => {
    currentMode = mode;
    setMode(mode);
  };

  const setPreferredProvider = (provider: string) => {
    currentPreferredProvider = provider;
    setPreferredProviderState(provider);
  };

  const setSelectedModel = (model: string) => {
    currentSelectedModel = model;
    setSelectedModelState(model);
  };

  const contextValue = React.useMemo(
    () => ({
      mode,
      setCurrentMode,
      preferredProvider,
      setPreferredProvider,
      selectedModel,
      setSelectedModel
    }),
    [mode, preferredProvider, selectedModel]
  );

  return (
    <ModeContext.Provider value={contextValue}>{children}</ModeContext.Provider>
  );
}

export default ModeContext;
