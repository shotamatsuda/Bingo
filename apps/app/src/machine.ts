import {
  assign,
  not,
  setup,
  type AnyEventObject,
  type CallbackActorLogic
} from 'xstate'

import {
  initState,
  pushEvent,
  reduceState,
  resetState,
  type ReducerOptions,
  type State,
  type StateOptions
} from './reducer'

export const CONNECT = 'CONNECT'
export const DISCONNECT = 'DISCONNECT'
export const CONTINUE = 'CONTINUE'
export const CANCEL = 'CANCEL'
export const PULSE = 'PULSE'

export interface PulseEvent {
  type: typeof PULSE
  time: number
  receivedTime: number
}

interface Context extends State<PulseEvent> {
  autoContinue: boolean
}

export interface MachineParams
  extends Partial<StateOptions>,
    Partial<ReducerOptions> {
  receiver: CallbackActorLogic<AnyEventObject>
  autoContinue?: boolean
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createMachine({
  receiver,
  sessionLength = 75,
  minInterval = 20,
  eventHistorySize = 100,
  autoContinue = false
}: MachineParams) {
  return setup({
    types: {} as unknown as {
      context: Context
      events:
        | { type: typeof CONNECT }
        | { type: typeof DISCONNECT }
        | { type: typeof CONTINUE }
        | { type: typeof CANCEL }
        | PulseEvent
    },
    actors: {
      receiver
    },
    actions: {
      pushEvent: assign(({ context, event }) =>
        event.type === PULSE
          ? pushEvent(context, event, {
              minInterval,
              eventHistorySize
            })
          : context
      ),
      reduceState: assign(({ context, event }) =>
        event.type === PULSE
          ? reduceState(context, event, {
              minInterval,
              eventHistorySize
            })
          : context
      )
    },
    guards: {
      shouldStop: ({ context }) => context.call != null,
      shouldContinue: ({ context }) => context.autoContinue
    }
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QQIYBcUGIAiBJAygMIDyAcqQKKEAqA2gAwC6ioADgPawCWaX7AdixAAPRAFoAjPQAs0gHQA2AMwAmZRIAcAdhX16ChQBoQAT3HSFGxVokBOBVtkLpmlQF83x1BkwBBAKrUxAD6JKTUuKT+FAzMSCAc3LwCQqIIkkpKAKxyGlkqWvoKKllSClnGZulK9LlKGhJZlrY2GhYa7p4g3ihyEFywAMYC-GCDaJCYYZQ0sUKJPHyC8WmS9KpyaraZWlktsjKV4iq2OVlathoKmlka9TYeXui9w-yj45ByXBAANmBTZAiURiTHmnEWKRW4nKSlyTVK61sKhUElkR3SalhpRKe3odnqBiUj26zzkr3eEwgX1+-wACv4ADL4EFxNjg5LLUCrC4KOSqehNFQuCQ1c7osTSGSbWwuFr1JQiizEnpkkZjSlyWBodisViTYRa9BgOQoABmEwATgAKegASkwKvJ6s+Wp1eogc3iCw5qXECthsjs9GRshleXFSguuQkWmU0g0d0VCmVpKdHyprt1+sNExN5rA1pqentjrV6c12qzHtBXvZS191WkORsSMa0i0Wkj6y04rUKjkeJKNUyLSFEhTGFVb2dVItAFc3lx+FApr5SIQKAzPWykvWoeksnpcjIspLLqjg0pe8o5NissOlKOXBOXmWNfPF8uTQB3FCLZeYPSTIsmCu6Qly0KxgOkZ3LIHaFAK6JNnINidpKeg6AqEjlC+U4Up8H78EuUByBakBzoMxGYNuCR1uBIh+gKciBtoMYFF2ka9rYzHXO22SZO2eJaLhabvguRFfmREAUVRtASKytFgZyDEHmozEojobQNJKKhXqYxzcRYqKdveSiCTGHhdPw7AQHAQg9KBELKasUhIooqjqNouhFOKxS8icLhXM4egKtIuH9EMb6QI5Pr7ms0j9uxQoNIUdwaBGDR8jGcYJv6SpdKW07pjFe4QekbTyPygrCqKPb6ek0i2BIKEykG2kuI4IlRVS3x-CV9GrMUWjQbp+gYfGVwRlGdy2PQTUniG9hdUVGqZu6-XOccGi1BIJQWKeHYcXVVSSJoiiWM4j62LN2j0MJBWpt1pHicRG0NmIHY5CcTQuOsu3lCo4oSHYmzAyxAo2KiRIPZOokES9X4oL+-5QG9cWWLU9hKAoc1aA0aj5BGzWQ41CpXJoZmaMt+GzgjJFSTJy5o2VH0FNKP1SAqBOA-VIr9me8ZSHoTUnJZbhAA */
    id: 'data',
    initial: 'disconnected',
    context: {
      ...initState<PulseEvent>({ sessionLength }),
      autoContinue
    },
    invoke: {
      id: 'receiver',
      src: 'receiver'
    },
    states: {
      disconnected: {
        on: {
          [CONNECT]: {
            target: 'connected'
          }
        }
      },
      connected: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              [CONTINUE]: {
                target: 'running',
                actions: assign(({ context }) => resetState(context))
              },
              [PULSE]: {
                actions: 'pushEvent'
              }
            }
          },
          stopped: {
            after: {
              0: {
                target: 'idle',
                guard: not('shouldContinue')
              },
              3000: {
                target: 'running',
                actions: assign(({ context }) => resetState(context)),
                guard: 'shouldContinue'
              }
            }
          },
          running: {
            initial: 'awaiting',
            states: {
              awaiting: {
                on: {
                  [PULSE]: {
                    target: 'reducing'
                  }
                }
              },
              reducing: {
                entry: 'reduceState',
                always: [
                  {
                    target: '#data.connected.stopped',
                    guard: 'shouldStop',
                    reenter: true
                  },
                  'awaiting'
                ]
              }
            },
            on: {
              [CANCEL]: {
                target: 'idle',
                actions: assign(({ context }) => resetState(context))
              }
            }
          }
        }
      }
    },
    on: {
      [DISCONNECT]: '.disconnected'
    }
  })
}
