import { shuffle } from 'lodash'

import { expectedCost, Node } from '@/fdr'

export interface EventConstraint {
  time: number
}

export interface Interval<Event extends EventConstraint> {
  value: number
  a: Event
  b: Event
}

export interface Call {
  count: number
  value: number
  flips: number[]
}

export interface State<Event extends EventConstraint> {
  expectedCost: number
  numbersLeft: number[]
  eventHistory: Event[]
  event: Event | null
  intervalHistory: Array<Interval<Event>>
  interval: Interval<Event> | null
  flips: number[]
  call: Call | null
  callHistory: Call[]
}

export interface StateOptions {
  sessionLength: number
}

export function initState<Event extends EventConstraint>({
  sessionLength
}: StateOptions): State<Event> {
  return {
    expectedCost: expectedCost(sessionLength),
    numbersLeft: shuffle(
      [...Array(sessionLength)].map((_, index) => index + 1)
    ),
    eventHistory: [],
    event: null,
    intervalHistory: [],
    interval: null,
    flips: [],
    callHistory: [],
    call: null
  }
}

export interface ReducerOptions {
  minInterval: number
  eventHistorySize: number
}

export function resetState<Event extends EventConstraint>(
  prevState: State<Event>
): State<Event> {
  return {
    ...prevState,
    expectedCost: expectedCost(prevState.numbersLeft.length),
    event: null,
    interval: null,
    flips: [],
    call: null
  }
}

function testCondition(
  nextEvent: EventConstraint,
  prevState: State<EventConstraint>,
  options: ReducerOptions
): boolean {
  const prevEvent = prevState.eventHistory[prevState.eventHistory.length - 1]
  return (
    prevEvent == null || nextEvent.time - prevEvent.time >= options.minInterval
  )
}

export function pushEvent<Event extends EventConstraint>(
  prevState: State<Event>,
  nextEvent: Event,
  options: ReducerOptions
): State<Event> {
  if (!testCondition(nextEvent, prevState, options)) {
    return prevState // Event doesn't satisfy condition
  }
  return {
    ...prevState,
    eventHistory: [...prevState.eventHistory, nextEvent].slice(
      Math.max(0, 1 - options.eventHistorySize)
    )
  }
}

export function reduceState<Event extends EventConstraint>(
  prevState: State<Event>,
  nextEvent: Event,
  options: ReducerOptions
): State<Event> {
  if (!testCondition(nextEvent, prevState, options)) {
    return prevState // Event doesn't satisfy condition
  }
  const nextState = {
    ...prevState,
    eventHistory: [...prevState.eventHistory, nextEvent].slice(
      Math.max(0, 1 - options.eventHistorySize)
    )
  }
  if (prevState.numbersLeft.length < 2) {
    return nextState // No numbers left
  }
  if (prevState.call != null) {
    return nextState // Last call is not cleared yet
  }

  if (prevState.event == null) {
    // Wait for the next event to form an interval.
    return { ...nextState, event: nextEvent }
  }

  const interval = {
    value: nextEvent.time - prevState.event.time,
    a: prevState.event,
    b: nextEvent
  }
  nextState.event = null
  nextState.intervalHistory = [...prevState.intervalHistory, interval].slice(
    Math.max(0, 1 - Math.floor(options.eventHistorySize / 2))
  )
  if (prevState.interval == null) {
    // Wait for the next interval to form a bit.
    return { ...nextState, interval }
  }

  const flip = prevState.interval.value < interval.value ? 0 : 1
  const flips = [...prevState.flips, flip]
  nextState.interval = null
  const node = new Node(prevState.numbersLeft.length).next(...flips)
  const expectedCost = node.depth() + node.expectedCost()
  if (!node.isLeaf()) {
    // Wait for the next flip.
    return {
      ...nextState,
      flips,
      expectedCost
    }
  }

  const [index] = node.possibleValues()
  const numbersLeft = [
    ...prevState.numbersLeft.slice(0, index),
    ...prevState.numbersLeft.slice(index + 1)
  ]
  const call = {
    count: prevState.callHistory.length + 1,
    value: prevState.numbersLeft[index],
    flips
  }
  const callHistory = [...prevState.callHistory, call]
  return {
    ...nextState,
    expectedCost,
    numbersLeft,
    flips,
    callHistory,
    call
  }
}
