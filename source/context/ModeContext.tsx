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
}

const ModeContext = createContext<ModeContextType>({
  mode: Mode.CHAT,
  setCurrentMode: (_mode: Mode) => {}
});

/**
 * Stores current mode of application outside of ModeProvider so any utility can look this up.
 * Should stay in sync with context state.
 */
let currentMode = Mode.CHAT;

export const getMode = (): Mode => {
  return currentMode;
};

export function ModeProvider({ children }: ModeProviderProps) {
  const [mode, setMode] = useState<Mode>(currentMode);

  const setCurrentMode = (mode: Mode) => {
    currentMode = mode;
    setMode(mode);
  };

  const contextValue = React.useMemo(
    () => ({
      mode,
      setCurrentMode
    }),
    [mode]
  );

  return (
    <ModeContext.Provider value={contextValue}>{children}</ModeContext.Provider>
  );
}
