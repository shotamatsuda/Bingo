import localFont from 'next/font/local'

export const akkurat = localFont({
  src: [
    {
      path: '../public/fonts/AkkuratLL-Thin.woff2',
      weight: '200',
      style: 'normal'
    },
    {
      path: '../public/fonts/AkkuratLL-ThinItalic.woff2',
      weight: '200',
      style: 'italic'
    },
    {
      path: '../public/fonts/AkkuratLL-Light.woff2',
      weight: '300',
      style: 'normal'
    },
    {
      path: '../public/fonts/AkkuratLL-LightItalic.woff2',
      weight: '300',
      style: 'italic'
    },
    {
      path: '../public/fonts/AkkuratLL-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../public/fonts/AkkuratLL-Italic.woff2',
      weight: '400',
      style: 'italic'
    },
    {
      path: '../public/fonts/AkkuratLL-Bold.woff2',
      weight: '700',
      style: 'normal'
    },
    {
      path: '../public/fonts/AkkuratLL-BoldItalic.woff2',
      weight: '700',
      style: 'italic'
    },
    {
      path: '../public/fonts/AkkuratLL-Black.woff2',
      weight: '900',
      style: 'normal'
    },
    {
      path: '../public/fonts/AkkuratLL-BlackItalic.woff2',
      weight: '900',
      style: 'italic'
    }
  ]
})
