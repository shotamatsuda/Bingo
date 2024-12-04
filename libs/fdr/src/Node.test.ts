import { Node } from '.'

describe('Node', () => {
  test('root', () => {
    const node = new Node(5)
    expect(node.v).toBe(1)
    expect(node.c).toBe(0)
  })

  test('isLeaf', () => {
    const node = new Node(5)
    expect(node.next(0, 0, 0).isLeaf()).toBe(true)
    expect(node.next(1, 0, 0).isLeaf()).toBe(true)
    expect(node.next(1, 0, 0, 0, 0).isLeaf()).toBe(true)
  })

  test('path', () => {
    const node = new Node(5)
    expect(node.next(0, 0, 0).path).toMatchObject([0, 0, 0])
    expect(node.next(1, 0, 0).path).toMatchObject([1, 0, 0])
    expect(node.next(1, 0, 0, 0, 0).path).toMatchObject([1, 0, 0])
  })
})
