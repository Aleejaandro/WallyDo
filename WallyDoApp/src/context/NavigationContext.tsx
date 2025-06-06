// src/context/NavigationContext.tsx
import React, { createContext, useContext, useState } from 'react';

type NavigationContextType = {
  lastRoute: string;
  setLastRoute: (route: string) => void;
};

const NavigationContext = createContext<NavigationContextType>({
  lastRoute: 'Tareas',
  setLastRoute: () => {},
});

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastRoute, setLastRoute] = useState('Tareas');
  return (
    <NavigationContext.Provider value={{ lastRoute, setLastRoute }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationHistory = () => useContext(NavigationContext);
