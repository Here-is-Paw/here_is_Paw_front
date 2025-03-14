import React, { createContext, useState, useContext, ReactNode } from "react";

type ButtonStates = {
  lost: boolean;
  found: boolean;
  hospital: boolean;
};

type ButtonStateContextType = {
  buttonStates: ButtonStates;
  toggleButton: (buttonName: "lost" | "found" | "hospital") => void;
};

const ButtonStateContext = createContext<ButtonStateContextType | undefined>(
  undefined
);

export const ButtonStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [buttonStates, setButtonStates] = useState({
    lost: false,
    found: false,
    hospital: false,
  });

  const toggleButton = (buttonName: "lost" | "found" | "hospital") => {
    setButtonStates((prev) => ({
      ...prev,
      [buttonName]: !prev[buttonName],
    }));
  };

  return (
    <ButtonStateContext.Provider value={{ buttonStates, toggleButton }}>
      {children}
    </ButtonStateContext.Provider>
  );
};

export const useButtonState = (): ButtonStateContextType => {
  const context = useContext(ButtonStateContext);
  if (context === undefined) {
    throw new Error("useButtonState must be used within a ButtonStateProvider");
  }
  return context;
};
