/// <reference types="w3c-web-serial" />

import {
  fromCallback,
  type AnyEventObject,
  type CallbackActorLogic
} from 'xstate'

import { readEvents } from '@/events'

import { CONNECT, DISCONNECT, PULSE } from './machine'

async function* readValues(port: SerialPort): AsyncIterable<Uint8Array> {
  while (port.readable != null) {
    const reader = port.readable.getReader()
    try {
      await reader.read() // Skip the initial buffer.
      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        yield value
      }
    } catch (error) {
      console.error(error)
    } finally {
      reader.releaseLock()
    }
  }
}

export function createSerialReceiver(): CallbackActorLogic<AnyEventObject> {
  return fromCallback(({ sendBack }) => {
    ;(async () => {
      const ports = await navigator.serial.getPorts()
      const port = ports[0]
      await port.open({ baudRate: 9600 })

      sendBack({ type: CONNECT })

      const values = readValues(port)
      const events = readEvents(values)
      for await (const event of events) {
        if (event.type === 'pulse') {
          sendBack({
            type: PULSE,
            time: event.time,
            receivedTime: Date.now()
          })
        }
      }
    })().catch(error => {
      console.error(error)
    })
  })
}

export interface InternalReceiverParams {
  countPerMinute?: number
}

export function createInternalReceiver({
  countPerMinute = 100
}: InternalReceiverParams = {}): CallbackActorLogic<AnyEventObject> {
  return fromCallback(({ sendBack }) => {
    sendBack({ type: CONNECT })

    let stopped = false
    let cancel: () => void
    let timers: NodeJS.Timeout[]
    ;(async () => {
      // eslint-disable-next-line no-unmodified-loop-condition
      while (!stopped) {
        await new Promise<void>(resolve => {
          cancel = resolve
          let count = 0
          const callback = (): void => {
            sendBack({
              type: PULSE,
              time: performance.now(),
              receivedTime: Date.now()
            })
            if (++count === countPerMinute) {
              resolve()
            }
          }
          timers = [...Array(countPerMinute)].map(() =>
            setTimeout(callback, 60000 * Math.random())
          )
        })
      }
    })().catch(error => {
      console.error(error)
    })
    return () => {
      stopped = true
      cancel()
      timers.forEach(timer => {
        clearTimeout(timer)
      })
      sendBack({ type: DISCONNECT })
    }
  })
}
