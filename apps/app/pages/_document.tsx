import {
  documentGetInitialProps,
  DocumentHeadTags,
  type DocumentHeadTagsProps
} from '@mui/material-nextjs/v13-pagesRouter'
import { type NextComponentType } from 'next'
import {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
  type DocumentProps
} from 'next/document'

const Document: NextComponentType<
  DocumentContext,
  DocumentInitialProps,
  DocumentProps & DocumentHeadTagsProps
> = props => (
  <Html lang='en'>
    <Head>
      <link rel='icon' href='data:;base64,=' />
      <DocumentHeadTags {...props} />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
)

Document.getInitialProps = async context => {
  return await documentGetInitialProps(context)
}

export default Document
