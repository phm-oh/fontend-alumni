// src/contexts/AppContext.js
import { createContext, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children, value }) => (
  <AppContext.Provider value={value}>{children}</AppContext.Provider>
);