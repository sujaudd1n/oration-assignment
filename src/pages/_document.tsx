import { Html, Head, Main, NextScript } from "next/document";
import { ThemeProvider } from "next-themes";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      {/*<ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >*/}
        <body className="antialiased">
          <Main />
          <NextScript />
        </body>
      {/*</ThemeProvider>*/}
    </Html>
  );
}
