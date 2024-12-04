import { css, CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material'
import { AppCacheProvider } from '@mui/material-nextjs/v13-pagesRouter'
import { type AppProps } from 'next/app'
import Head from 'next/head'
import { type FC } from 'react'

import { darkTheme, lightTheme } from '../src/themes'
import { type PageProps } from '../src/types'

const App: FC<AppProps<PageProps>> = props => {
  const {
    Component,
    pageProps: { colorScheme, ...pageProps }
  } = props

  const theme = colorScheme === 'light' ? lightTheme : darkTheme
  return (
    <AppCacheProvider {...props}>
      <Head>
        <title>Bingo</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={css`
            html {
              // "lang=ja" automatically sets this but it makes fonts little
              // bigger in Chrome. I don't know whether it's Chrome's behavior or
              // some libraries are injecting styles.
              -webkit-locale: auto;
            }

            body {
              font-family: ${theme.typography.fontFamily};
              letter-spacing: 0.015em;
            }

            html,
            body,
            #__next {
              width: 100%;
              height: 100%;
            }

            * {
              letter-spacing: inherit;
            }

            /* Disable touch ripple */
            .MuiTouchRipple-root {
              animation: none !important;

              .MuiTouchRipple-ripple {
                animation: none !important;
                transform: scale(2) !important;
              }

              .MuiTouchRipple-rippleVisible {
                opacity: 0.05 !important;
              }

              .MuiTouchRipple-child {
                border-radius: 0 !important;
                animation: none !important;
              }
            }
          `}
        />
        <Component {...pageProps} />
      </ThemeProvider>
    </AppCacheProvider>
  )
}

export default App
