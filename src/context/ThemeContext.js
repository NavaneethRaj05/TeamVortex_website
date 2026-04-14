import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({ isDark: true });

// Always dark — toggle removed. Keeps the context for future use without breaking imports.
export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
