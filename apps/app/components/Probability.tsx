import { styled, useTheme } from '@mui/material'
import { Stack } from '@mui/system'
import {
  line as createLine,
  curveBasis,
  scaleLinear,
  type ScaleLinear
} from 'd3'
import { max } from 'lodash'
import { Fragment, useMemo, type FC, type SVGProps } from 'react'
import { useMeasure } from 'react-use'

import { createCumulativeValues, createValues } from '@/bingo'

import { isNotNullish } from '../helpers/assertions'
import { useMachineContext } from '../helpers/useMachineContext'
import { machineAtom } from '../src/states'

interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

const Title = styled('div')`
  text-align: center;
  font-size: 24px;
  letter-spacing: 0.02em;
`

const Root = styled('div')`
  flex-grow: 1;
  flex-shrink: 1;
`

const Svg = styled('svg')`
  display: block;
  fill: none;
  stroke: none;
`

const Number = styled('text')`
  font-size: 16px;
  font-variant-numeric: tabular-nums;
`

const Text = styled('text')`
  font-size: 16px;
  letter-spacing: 0.04em;
`

const Line: FC<
  Omit<SVGProps<SVGPathElement>, 'values'> & {
    values: readonly number[]
    scaleX: ScaleLinear<number, number>
    scaleY: ScaleLinear<number, number>
  }
> = ({ values, scaleX, scaleY, ...props }) => {
  const path = useMemo(
    () =>
      createLine()
        .x(d => d[0])
        .y(d => d[1])
        .curve(curveBasis)(
        values.map((value, index) => [scaleX(index + 1), scaleY(value)])
      ),
    [values, scaleX, scaleY]
  )
  return path != null && <path fill='none' {...props} d={path} />
}

const Ticks: FC<{
  width: number
  ticks: number
  scale: ScaleLinear<number, number>
  placement: 'left' | 'right'
  grid?: boolean
  textColor?: string
}> = ({ width, ticks, scale, placement, grid = false, textColor }) => {
  const values = useMemo(() => scale.ticks(ticks), [ticks, scale])
  const theme = useTheme()
  return (
    <>
      {placement === 'left'
        ? values.map(value => {
            const y = scale(value)
            return (
              <Fragment key={value}>
                {grid && (
                  <line
                    x1={0}
                    x2={width}
                    y1={y}
                    y2={y}
                    stroke={theme.palette.background.paper}
                    style={{ mixBlendMode: 'screen' }}
                  />
                )}
                <line
                  x1={0}
                  x2={-5}
                  y1={y}
                  y2={y}
                  stroke={theme.palette.primary.main}
                />
                <Number
                  y={y}
                  dx={-12}
                  fill={textColor ?? theme.palette.primary.main}
                  textAnchor='end'
                  dominantBaseline='central'
                >
                  {value}
                </Number>
              </Fragment>
            )
          })
        : values.map(value => {
            const y = scale(value)
            return (
              <Fragment key={value}>
                {grid && (
                  <line
                    x1={0}
                    x2={width}
                    y1={y}
                    y2={y}
                    stroke={theme.palette.background.paper}
                    style={{ mixBlendMode: 'screen' }}
                  />
                )}
                <line
                  x1={width}
                  x2={width + 5}
                  y1={y}
                  y2={y}
                  stroke={theme.palette.primary.main}
                />
                <Number
                  x={width}
                  y={y}
                  dx={12}
                  fill={textColor ?? theme.palette.primary.main}
                  textAnchor='start'
                  dominantBaseline='central'
                >
                  {value}
                </Number>
              </Fragment>
            )
          })}
    </>
  )
}

const SingleTurn: FC<{
  width: number
  height: number
  insets: Insets
  callCount?: number
  boardCount: number
  sessionLength: number
  scaleX: ScaleLinear<number, number>
}> = ({
  width,
  height,
  insets,
  callCount,
  boardCount,
  sessionLength,
  scaleX
}) => {
  const values1 = useMemo(() => createValues(1, sessionLength), [sessionLength])
  const valuesN = useMemo(
    () => createValues(boardCount, sessionLength),
    [boardCount, sessionLength]
  )
  const scaleY = useMemo(
    () =>
      scaleLinear()
        .domain([0, max(valuesN) ?? 0])
        .range([height, 0])
        .nice(2),
    [height, valuesN]
  )
  const theme = useTheme()
  const textColor =
    theme.palette.secondary[theme.palette.mode === 'light' ? 'dark' : 'light']
  return (
    <>
      <Text
        x={width}
        y={-insets.top}
        dx={insets.right}
        fill={textColor}
        textAnchor='end'
        dominantBaseline='hanging'
      >
        Single turn <tspan fontStyle='italic'>p</tspan>
      </Text>
      <Ticks
        width={width}
        ticks={2}
        scale={scaleY}
        placement='right'
        grid
        textColor={textColor}
      />
      <Line
        values={values1}
        scaleX={scaleX}
        scaleY={scaleY}
        stroke={theme.palette.secondary.main}
        strokeWidth={2}
      />
      <Line
        values={valuesN}
        scaleX={scaleX}
        scaleY={scaleY}
        stroke={theme.palette.secondary.main}
        strokeWidth={2}
      />
    </>
  )
}

const Cumulative: FC<{
  width: number
  height: number
  insets: Insets
  callCount?: number
  boardCount: number
  sessionLength: number
  scaleX: ScaleLinear<number, number>
}> = ({
  width,
  height,
  insets,
  callCount,
  boardCount,
  sessionLength,
  scaleX
}) => {
  const values1 = useMemo(
    () => createCumulativeValues(1, sessionLength),
    [sessionLength]
  )
  const valuesN = useMemo(
    () => createCumulativeValues(boardCount, sessionLength),
    [boardCount, sessionLength]
  )
  const scaleY = useMemo(
    () => scaleLinear().domain([0, 1]).range([height, 0]).nice(2),
    [height]
  )
  const theme = useTheme()
  return (
    <>
      <Text
        x={0}
        y={-insets.top}
        dx={-insets.left}
        fill={theme.palette.primary.main}
        textAnchor='start'
        dominantBaseline='hanging'
      >
        Cumulative <tspan fontStyle='italic'>p</tspan>
      </Text>
      <Ticks width={width} ticks={2} scale={scaleY} placement='left' />
      <Line
        values={values1}
        scaleX={scaleX}
        scaleY={scaleY}
        stroke={theme.palette.primary.main}
        strokeWidth={2}
      />
      <Line
        values={valuesN}
        scaleX={scaleX}
        scaleY={scaleY}
        stroke={theme.palette.primary.main}
        strokeWidth={2}
      />
      {callCount != null && callCount > 0 && callCount <= 75 && (
        <>
          <circle
            cx={scaleX(callCount)}
            cy={scaleY(values1[callCount - 1])}
            r={4}
            fill={theme.palette.primary.main}
          />
          <circle
            cx={scaleX(callCount)}
            cy={scaleY(valuesN[callCount - 1])}
            r={4}
            fill={theme.palette.primary.main}
          />
        </>
      )}
    </>
  )
}

const Graph: FC<{
  width?: number
  height?: number
  insets?: Insets
  callCount?: number
  boardCount?: number
  sessionLength?: number
}> = ({
  width = 300,
  height = 150,
  insets = {
    top: 36,
    right: 48,
    bottom: 28,
    left: 48
  },
  callCount,
  boardCount = 1,
  sessionLength = 75
}) => {
  const innerWidth = width - insets.right - insets.left
  const innerHeight = height - insets.top - insets.bottom

  const scaleX = useMemo(
    () => scaleLinear().domain([1, sessionLength]).range([0, innerWidth]),
    [innerWidth, sessionLength]
  )
  const ticksX = [
    1,
    ...scaleX.ticks(sessionLength / 10),
    sessionLength >= 75 ? 75 : undefined
  ].filter(isNotNullish)

  const theme = useTheme()
  return (
    <Svg width={width} height={height}>
      <g transform={`translate(${insets.left}, ${insets.top})`}>
        {callCount != null && callCount > 0 && callCount <= 75 && (
          <line
            x1={scaleX(callCount)}
            x2={scaleX(callCount)}
            y1={0}
            y2={innerHeight}
            stroke={theme.palette.primary.main}
            strokeWidth={1}
          />
        )}
        <SingleTurn
          width={innerWidth}
          height={innerHeight}
          insets={insets}
          callCount={callCount}
          boardCount={boardCount}
          sessionLength={sessionLength}
          scaleX={scaleX}
        />
        <Cumulative
          width={innerWidth}
          height={innerHeight}
          insets={insets}
          callCount={callCount}
          boardCount={boardCount}
          sessionLength={sessionLength}
          scaleX={scaleX}
        />
        {ticksX.map(value => {
          const x = scaleX(value)
          return (
            <Fragment key={value}>
              <line
                key={value}
                x1={x}
                x2={x}
                y1={innerHeight}
                y2={innerHeight + 5}
                stroke={theme.palette.primary.main}
              />
              <Number
                x={x}
                y={innerHeight}
                dy={insets.bottom}
                fill={theme.palette.primary.main}
                textAnchor='middle'
                dominantBaseline='text-after-edge'
              >
                {value}
              </Number>
            </Fragment>
          )
        })}
      </g>
    </Svg>
  )
}

export interface ProbabilityProps {
  boardCount?: number
  sessionLength?: number
}

export const Probability: FC<ProbabilityProps> = props => {
  const callCount = useMachineContext(
    machineAtom,
    ({ callHistory }) => callHistory.length + 1
  )
  let title
  switch (callCount % 10) {
    case 1:
      title = `${callCount}st`
      break
    case 2:
      title = `${callCount}nd`
      break
    case 3:
      title = `${callCount}rd`
      break
    default:
      title = `${callCount}th`
      break
  }

  const [ref, { width, height }] = useMeasure<HTMLDivElement>()

  return (
    <Stack minWidth={0} minHeight={0}>
      <Title>
        {title} call{' '}
        {props.boardCount != null ? `for ${props.boardCount} boards` : ''}
      </Title>
      <Root ref={ref}>
        <Graph {...props} width={width} height={height} callCount={callCount} />
      </Root>
    </Stack>
  )
}
