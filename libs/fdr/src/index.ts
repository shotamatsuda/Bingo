import invariant from 'tiny-invariant'

export * from './Node'

// Implementation of Fast Dice Roller algorithm:
// https://arxiv.org/abs/1304.1916
export function random(n: number, flips?: readonly number[]): number {
  let v = 1
  let c = 0
  let i = 0
  while (true) {
    const flip = flips?.[i++] ?? (Math.random() < 0.5 ? 0 : 1)
    invariant(flip === 0 || flip === 1)
    v = v << 1
    c = (c << 1) + flip
    if (v >= n) {
      if (c < n) {
        return c
      } else {
        v = v - n
        c = c - n
      }
    }
  }
}

export function expectedCost(n: number): number {
  if (n < 2) {
    return 0
  }
  let sum = 0
  for (let k = 0; k < n; ++k) {
    sum += (2 ** k % n) * (1 / 2 ** k)
  }
  return (2 ** n / (2 ** n - 1)) * sum
}
