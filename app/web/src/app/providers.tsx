"use client";

import { SWRConfig } from "swr";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ReactNode } from "react";
import { fetcher } from "../lib/api";

const theme = createTheme();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SWRConfig
        value={{
          fetcher: (url) => fetcher(url),
          shouldRetryOnError: false,
        }}
      >
        {children}
      </SWRConfig>
    </ThemeProvider>
  );
}

