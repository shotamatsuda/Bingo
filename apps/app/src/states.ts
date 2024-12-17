import { atom } from 'jotai'
import { atomWithMachine } from 'jotai-xstate'

import { createMachine } from './machine'
import { createInternalReceiver, createSerialReceiver } from './receivers'

export const serialPortAtom = atom<SerialPort | null>(null)

export const machineAtomAtom = atom(get => {
  const serialPort = get(serialPortAtom)
  const receiver =
    serialPort != null
      ? createSerialReceiver(serialPort)
      : createInternalReceiver()
  return atomWithMachine(() =>
    createMachine({
      receiver,
      autoContinue: true
    })
  )
})
