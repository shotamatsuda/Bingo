import { atom } from 'jotai'
import { atomWithMachine } from 'jotai-xstate'

import { createMachine } from './machine'
import { createNullReceiver, createSerialReceiver } from './receivers'

export const serialPortAtom = atom<SerialPort | null>(null)

export const machineAtomAtom = atom(get => {
  const serialPort = get(serialPortAtom)
  const receiver =
    serialPort != null ? createSerialReceiver(serialPort) : createNullReceiver()
  return atomWithMachine(() =>
    createMachine({
      receiver,
      autoContinue: true
    })
  )
})

export const boardCountAtom = atom(40)
export const openSetupAtom = atom(true)
