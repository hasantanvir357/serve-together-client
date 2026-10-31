"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Client-side theme provider (next-themes).
 * Keeps all theme logic out of the server-rendered tree.
 */
export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="serve-together-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
