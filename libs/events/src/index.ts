export const ESCAPE_VALUE = 27
export const PULSE_VALUE = 1
export const HEARTBEAT_VALUE = 2
export const VALUE_PRESCALER = 8

export type EventType = 'pulse' | 'heartbeat'

export interface Event {
  type: EventType
  time: number
}

export interface ReadEventsOptions {
  raw?: boolean
}

export async function* readEvents(
  asyncIterator: AsyncIterable<Uint8Array>,
  { raw = false }: ReadEventsOptions = {}
): AsyncIterable<Event> {
  let escaped = false
  let eventType: EventType | undefined
  const buffer = new Uint8Array(4)
  let bufferIndex = 0
  const dataView = new DataView(buffer.buffer)

  for await (const values of asyncIterator) {
    for (const value of values) {
      if (!escaped && value === ESCAPE_VALUE) {
        escaped = true
        continue
      }
      if (escaped && value === PULSE_VALUE) {
        eventType = 'pulse'
        bufferIndex = 0
      } else if (escaped && value === HEARTBEAT_VALUE) {
        eventType = 'heartbeat'
        bufferIndex = 0
      } else if (
        (!escaped || (escaped && value === ESCAPE_VALUE)) &&
        eventType != null &&
        bufferIndex < buffer.length
      ) {
        buffer[bufferIndex++] = value
        if (bufferIndex === buffer.length) {
          const data = dataView.getUint32(0)
          yield {
            type: eventType,
            time: raw ? data : (data * VALUE_PRESCALER) / 1000
          }
        }
      }
      escaped = false
    }
  }
}
