import { atom } from 'jotai'
import { atomWithMachine } from 'jotai-xstate'

import { createMachine } from './machine'
import { createInternalReceiver } from './receivers'

export const receiverAtom = atom(createInternalReceiver())

export const machineAtom = atomWithMachine(get =>
  createMachine({
    receiver: get(receiverAtom),
    autoContinue: true
  })
)
