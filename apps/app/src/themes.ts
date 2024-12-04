import { createTheme, type ThemeOptions } from '@mui/material'
import { grey } from '@mui/material/colors'
import { merge } from 'lodash'

import { akkurat } from './fonts'

const options: ThemeOptions = {
  typography: {
    fontFamily: akkurat.style.fontFamily
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'unset'
        },
        sizeLarge: {
          fontSize: 16
        }
      }
    },
    MuiFilledInput: {
      defaultProps: {
        disableUnderline: true
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius
        }),
        input: ({ theme }) => ({
          paddingTop: theme.spacing(1)
        })
      }
    }
  }
}

const theme = createTheme(options)

export const darkTheme = createTheme(
  merge({}, options, {
    palette: {
      mode: 'dark',
      primary: {
        ...theme.palette.augmentColor({
          color: {
            main: grey[50]
          }
        })
      },
      secondary: theme.palette.augmentColor({
        color: {
          main: grey[600]
        }
      }),
      background: {
        default: '#000',
        paper: grey[800]
      }
    }
  } satisfies ThemeOptions)
)

export const lightTheme = createTheme(
  merge({}, options, {
    palette: {
      mode: 'light',
      primary: {
        ...theme.palette.augmentColor({
          color: {
            main: grey[900]
          }
        })
      },
      secondary: theme.palette.augmentColor({
        color: {
          main: grey[400]
        }
      }),
      background: {
        default: '#fff',
        paper: grey[200]
      }
    }
  } satisfies ThemeOptions)
)
