import { atom } from 'jotai'
import { atomWithMachine } from 'jotai-xstate'

import { createMachine } from './machine'
import { createNullReceiver, type Receiver } from './receivers'

export const receiverAtom = atom<Receiver | null>(null)

export const machineAtomAtom = atom(get => {
  const receiver = get(receiverAtom)
  return atomWithMachine(() =>
    createMachine({
      receiver: receiver ?? createNullReceiver()
      // autoContinue: true
    })
  )
})

export const boardCountAtom = atom(40)
export const openSettingsAtom = atom(true)
