import { css, styled, useTheme } from '@mui/material'
import { scaleLinear, type ScaleLinear } from 'd3'
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue
} from 'framer-motion'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, type FC, type ReactNode } from 'react'
import { useMeasure } from 'react-use'

import { type Interval } from '@/bingo'

import { type PulseEvent } from '../src/machine'
import { machineAtomAtom } from '../src/states'

const Root = styled('div')`
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: ${({ theme }) => `solid 1px ${theme.palette.secondary.main}`};
`

const Svg = styled('svg')`
  display: block;
  width: 100%;
  height: 100%;
`

const Text = styled('text')`
  font-variant-numeric: tabular-nums;
`

const Item: FC<{
  event: PulseEvent
  scaleY: ScaleLinear<number, number>
  children?: ReactNode
}> = ({ event, scaleY, children }) => {
  const y = useMotionValue(scaleY(Date.now() - event.receivedTime))
  useAnimationFrame(() => {
    y.set(scaleY(Date.now() - event.receivedTime))
  })
  return <motion.g style={{ y }}>{children}</motion.g>
}

const EventItem: FC<{
  event: PulseEvent
  scaleY: ScaleLinear<number, number>
}> = ({ event, scaleY }) => {
  const theme = useTheme()
  return (
    <Item event={event} scaleY={scaleY}>
      <line
        x1='0%'
        x2='100%'
        stroke={theme.palette.secondary.main}
        strokeWidth={1}
      />
      <circle r={6} cx='50%' fill={theme.palette.primary.main} />
    </Item>
  )
}

const IntervalItem: FC<{
  interval: Interval<PulseEvent>
  scaleY: ScaleLinear<number, number>
}> = ({ interval, scaleY }) => {
  const height = Math.abs(scaleY(interval.b.time) - scaleY(interval.a.time))
  const text = (
    <>
      {(interval.b.time - interval.a.time).toFixed(1)}
      <tspan dx={5} fillOpacity={0.5}>
        ms
      </tspan>
    </>
  )
  const theme = useTheme()
  return (
    <Item key={interval.a.time} event={interval.a} scaleY={scaleY}>
      <rect
        width='100%'
        height={height}
        fill={theme.palette.background.paper}
      />
      {height < 50 ? (
        <>
          <line
            x1='50%'
            x2='50%'
            y2={height}
            stroke={theme.palette.primary.main}
            strokeWidth={1}
          />
          <Text
            x='50%'
            y={height / 2}
            dx={30}
            fill={theme.palette.primary.main}
            fontSize={16}
            textAnchor='left'
            dominantBaseline='central'
          >
            {text}
          </Text>
        </>
      ) : (
        <>
          <line
            x1='50%'
            x2='50%'
            y2={height / 2 - 15}
            stroke={theme.palette.primary.main}
            strokeWidth={1}
          />
          <line
            x1='50%'
            x2='50%'
            y1={height / 2 + 15}
            y2={height}
            stroke={theme.palette.primary.main}
            strokeWidth={1}
          />
          <Text
            x='50%'
            y={height / 2}
            fill={theme.palette.primary.main}
            fontSize={16}
            textAnchor='middle'
            dominantBaseline='central'
          >
            {text}
          </Text>
        </>
      )}
    </Item>
  )
}

const FlashLayer = styled('div')`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 100%;
  aspect-ratio: 2;
  background-color: ${({ theme }) => theme.palette.primary.main};
  border-radius: 100%;
  transform: translate3d(-50%, 99.99%, 0);
`

const Flash: FC<{
  events: readonly PulseEvent[]
}> = ({ events }) => {
  const opacity = useMotionValue(0)
  useEffect(() => {
    opacity.set(1)
    void animate(opacity, 0, {
      duration: 0.5,
      ease: 'easeOut'
    })
  }, [events, opacity])

  return (
    <motion.div style={{ opacity }}>
      <FlashLayer
        css={css`
          filter: blur(120px);
        `}
      />
      <FlashLayer
        css={css`
          filter: blur(300px);
        `}
      />
    </motion.div>
  )
}

function useEvents({ duration }: { duration: number }): PulseEvent[] {
  const [snapshot] = useAtom(useAtomValue(machineAtomAtom))
  const eventHistory = snapshot.context.eventHistory
  return useMemo(() => {
    const past = Date.now() - duration
    const index = eventHistory.findLastIndex(
      ({ receivedTime }) => receivedTime < past
    )
    return index > 0 ? eventHistory.slice(index) : eventHistory
  }, [duration, eventHistory])
}

function useIntervals({
  duration
}: {
  duration: number
}): Array<Interval<PulseEvent>> {
  const [snapshot] = useAtom(useAtomValue(machineAtomAtom))
  const intervalHistory = snapshot.context.intervalHistory
  return useMemo(() => {
    const past = Date.now() - duration
    const index = intervalHistory.findLastIndex(
      ({ a: { receivedTime } }) => receivedTime < past
    )
    return index > 0 ? intervalHistory.slice(index) : intervalHistory
  }, [duration, intervalHistory])
}

export interface EventsProps {
  duration?: number
}

export const Events: FC<EventsProps> = ({ duration = 5000 }) => {
  const [ref, { height }] = useMeasure<HTMLDivElement>()
  const scaleY = useMemo(
    () => scaleLinear().domain([0, duration]).range([height, 0]),
    [duration, height]
  )

  const events = useEvents({ duration })
  const intervals = useIntervals({ duration })
  return (
    <Root ref={ref}>
      <Svg>
        {intervals.map(interval => (
          <IntervalItem
            key={interval.a.time}
            interval={interval}
            scaleY={scaleY}
          />
        ))}
        {events.map(event => (
          <EventItem key={event.time} event={event} scaleY={scaleY} />
        ))}
      </Svg>
      <Flash events={events} />
    </Root>
  )
}
