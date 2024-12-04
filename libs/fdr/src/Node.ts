// Node-based implementation of Fast Dice Roller algorithm:
// https://arxiv.org/abs/1304.1916

import { mean } from 'lodash'
import invariant from 'tiny-invariant'

import { expectedCost } from '.'

export class Node {
  constructor(
    readonly n: number,
    readonly v = 1,
    readonly c = 0,
    readonly path: readonly number[] = []
  ) {}

  isLeaf(): boolean {
    return this.v >= this.n && this.c < this.n
  }

  isRoot(): boolean {
    return this.path.length === 0
  }

  depth(): number {
    return this.path.length
  }

  children(): Node[] {
    return this.isLeaf() ? [] : [this.next(0), this.next(1)]
  }

  next(...flips: readonly number[]): Node {
    if (this.isLeaf()) {
      return this
    }
    let { n, v, c } = this
    const path = [...this.path]
    for (const flip of flips) {
      invariant(flip === 0 || flip === 1)
      v = v << 1
      c = (c << 1) + flip
      path.push(flip)
      if (v >= n) {
        if (c < n) {
          break
        } else {
          v = v - n
          c = c - n
        }
      }
    }
    return new Node(n, v, c, path)
  }

  possibleValues(result: number[] = []): number[] {
    if (this.isLeaf()) {
      result.push(this.c)
    } else if (result.length < this.n) {
      this.children().forEach(node => {
        node.possibleValues(result)
      })
    }
    return result
  }

  private shortestLeaf(): Node {
    let node = this.next(0)
    while (!node.isLeaf()) {
      node = node.next(0)
    }
    return node
  }

  isPeriodic(): boolean {
    return (
      this.depth() > 0 &&
      this.path.every(flip => flip === 1) &&
      this.shortestLeaf().possibleValues()[0] === 0
    )
  }

  expectedCost(): number {
    if (this.isLeaf()) {
      return 0
    }
    if (this.isRoot()) {
      return expectedCost(this.n)
    }
    // Brute-force solution of infinite sum only for small n.
    return this.isPeriodic()
      ? expectedCost(this.n)
      : mean(this.children().map(node => 1 + node.expectedCost()))
  }
}
