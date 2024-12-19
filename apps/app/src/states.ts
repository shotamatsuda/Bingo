import { atom } from 'jotai'
import { atomWithMachine } from 'jotai-xstate'

import { createMachine } from './machine'
import { createNullReceiver, type Receiver } from './receivers'

export const openSettingsAtom = atom(true)
export const boardCountAtom = atom(40)
export const restoreLastSessionAtom = atom(false)
export const receiverAtom = atom<Receiver | null>(null)

export const machineAtomAtom = atom(get => {
  const receiver = get(receiverAtom)
  const restoreLastSession = get(restoreLastSessionAtom)
  return atomWithMachine(() =>
    createMachine({
      receiver: receiver ?? createNullReceiver(),
      restoreLastSession
      // autoContinue: true
    })
  )
})
