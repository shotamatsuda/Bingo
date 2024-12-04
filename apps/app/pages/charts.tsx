import { alpha, Container, Stack, styled } from '@mui/material'
import { range } from 'lodash'
import { type GetStaticProps, type NextPage } from 'next'

import { createCumulativeValues, createValues } from '@/bingo'
import { expectedCost } from '@/fdr'

import { Chart, chartColors } from '../components/Chart'
import { type PageProps } from '../src/types'

const Root = styled('div')`
  width: 100%;
  min-height: 100%;
`

const Index: NextPage = () => {
  return (
    <Root>
      <Container maxWidth='md'>
        <Stack spacing={8} padding={8}>
          <Chart
            type='line'
            data={{
              datasets: [
                {
                  label: 'Rejection sampling',
                  data: range(200).map(x => ({
                    x,
                    y: (Math.log2(x) * 2 ** Math.ceil(Math.log2(x))) / x
                  })),
                  tension: 0,
                  borderColor: chartColors.blue
                },
                {
                  label: 'Fast Dice Roll',
                  data: range(200).map(x => ({ x, y: expectedCost(x) })),
                  tension: 0,
                  borderColor: chartColors.red
                },
                {
                  label: 'Lower bound',
                  data: range(200).map(x => ({
                    x,
                    y: Math.ceil(Math.log2(x))
                  })),
                  borderColor: chartColors.yellow
                },
                {
                  label: 'log₂(n)',
                  data: range(200).map(x => ({ x, y: Math.log2(x) })),
                  borderColor: chartColors.orange
                }
              ]
            }}
            options={{
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Number of values'
                  }
                },
                y: {
                  min: 2,
                  title: {
                    display: true,
                    text: 'Expected number of flips'
                  }
                }
              }
            }}
          />
          <Chart
            type='line'
            data={{
              datasets: [
                {
                  label: '1 board',
                  data: createCumulativeValues(1, 75).map((value, index) => ({
                    x: index + 1,
                    y: value
                  })),
                  tension: 0.4,
                  borderColor: chartColors.blue
                },
                {
                  label: '10 boards',
                  data: createCumulativeValues(10, 75).map((value, index) => ({
                    x: index + 1,
                    y: value
                  })),
                  tension: 0.4,
                  borderColor: chartColors.red
                },
                {
                  label: '50 boards',
                  data: createCumulativeValues(50, 75).map((value, index) => ({
                    x: index + 1,
                    y: value
                  })),
                  tension: 0.4,
                  borderColor: chartColors.orange
                },
                {
                  label: '',
                  data: createValues(1, 75).map((value, index) => ({
                    x: index + 1,
                    y: value
                  })),
                  tension: 0.4,
                  borderColor: alpha(chartColors.blue, 0.5),
                  yAxisID: 'y2'
                },
                {
                  label: '',
                  data: createValues(10, 75).map((value, index) => ({
                    x: index + 1,
                    y: value
                  })),
                  tension: 0.4,
                  borderColor: alpha(chartColors.red, 0.5),
                  yAxisID: 'y2'
                },
                {
                  label: '',
                  data: createValues(50, 75).map((value, index) => ({
                    x: index + 1,
                    y: value
                  })),
                  tension: 0.4,
                  borderColor: alpha(chartColors.orange, 0.5),
                  yAxisID: 'y2'
                }
              ]
            }}
            options={{
              scales: {
                x: {
                  min: 1,
                  max: 75,
                  title: {
                    display: true,
                    text: 'Number of calls'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Cumulative probability'
                  }
                },
                y2: {
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Probability'
                  },
                  grid: {
                    drawOnChartArea: false
                  }
                }
              },
              plugins: {
                legend: {
                  labels: {
                    filter: item => item.text !== ''
                  }
                },
                annotation: {
                  annotations: {
                    y: {
                      type: 'line',
                      yMin: 0.5,
                      yMax: 0.5,
                      borderColor: 'rgba(0, 0, 0, 0.25)',
                      borderWidth: 1,
                      borderDash: [4, 4]
                    }
                  }
                }
              }
            }}
          />
        </Stack>
      </Container>
    </Root>
  )
}

export default Index

export const getStaticProps: GetStaticProps<PageProps> = () => {
  return {
    props: {
      colorScheme: 'light'
    }
  }
}
