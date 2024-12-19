import { styled } from '@mui/material'
import { type GetStaticProps, type NextPage } from 'next'

import { Call } from '../components/Call'
import { Events } from '../components/Events'
import { Flips } from '../components/Flips'
import { History } from '../components/History'
import { Probability } from '../components/Probability'
import { Screen } from '../components/Screen'
import { Settings } from '../components/Settings'
import { type PageProps } from '../src/types'

const Root = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

const Columns = styled('div')`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  column-gap: 64px;
  box-sizing: border-box;
  width: 100%;
  padding: 48px;
`

const Rows = styled('div')`
  display: grid;
  grid-template-rows: 1fr 4fr 1fr;
  column-gap: 64px;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
`

const Column = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
`

const Index: NextPage = () => (
  <>
    <Screen>
      <Root>
        <Columns>
          <Column>
            <Events />
          </Column>
          <Rows>
            <Probability />
            <Call />
            <Flips />
          </Rows>
          <Column>
            <History />
          </Column>
        </Columns>
      </Root>
    </Screen>
    <Settings />
  </>
)

export default Index

export const getStaticProps: GetStaticProps<PageProps> = () => {
  return {
    props: {
      colorScheme: 'dark'
    }
  }
}
