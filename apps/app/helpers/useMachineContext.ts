import { atom, useAtomValue, type Atom } from 'jotai'
import { useMemo, useRef } from 'react'
import { type MachineSnapshot } from 'xstate'

type ContextOf<
  T extends MachineSnapshot<any, any, any, any, any, any, any, any>
> =
  T extends MachineSnapshot<infer Context, any, any, any, any, any, any, any>
    ? Context
    : never

export function useMachineContext<
  T extends MachineSnapshot<any, any, any, any, any, any, any, any>,
  V
>(machineAtom: Atom<T>, callback: (context: ContextOf<T>) => V): V {
  const callbackRef = useRef(callback)
  callbackRef.current = callback
  return useAtomValue(
    useMemo(
      () => atom(get => callbackRef.current(get(machineAtom).context)),
      [machineAtom]
    )
  )
}
