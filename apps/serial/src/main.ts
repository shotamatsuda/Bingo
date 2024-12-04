import { createWriteStream } from 'fs'
import { SerialPort } from 'serialport'

import { readEvents } from '@/events'

async function* readValues(): AsyncIterable<Uint8Array> {
  const port = new SerialPort({
    path: '/dev/tty.usbserial-AB0OCI7H',
    baudRate: 9600
  })
  while (true) {
    yield await new Promise(resolve => {
      port.once('data', (data: Buffer) => {
        resolve(new Uint8Array(data))
      })
    })
  }
}

async function main(): Promise<void> {
  const stream = createWriteStream('apps/app/serial/out/pulse.txt', {
    flags: 'a'
  })
  const values = readValues()
  const events = readEvents(values, { raw: true })
  for await (const event of events) {
    if (event.type === 'pulse') {
      stream.write(`${event.time}\n`)
      console.log(event.time)
    }
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
