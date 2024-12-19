import { createReadStream, createWriteStream } from 'fs'
import { createInterface } from 'readline/promises'

;(async () => {
  const ws = createWriteStream('apps/app/serial/out/random.txt')
  const rs = createReadStream('apps/app/serial/out/pulse.txt')
  const readline = createInterface(rs)
  let stack = []
  for await (const line of readline) {
    stack.push(line)
    if (stack.length === 4) {
      const [a, b, c, d] = stack
      stack = []
      ws.write(+b - +a < +d - +c ? '0' : '1')
    }
  }
})().catch(error => {
  console.error(error)
  process.exit(1)
})
;(async () => {
  const rs = createReadStream('apps/app/serial/out/pulse.txt')
  const readline = createInterface(rs)
  for await (const line of readline) {
    if (line.length < 5) {
      console.log(line)
    }
  }
})().catch(error => {
  console.error(error)
  process.exit(1)
})
