import { styled } from '@mui/material'
import { Stack } from '@mui/system'
import { useAtom, useAtomValue } from 'jotai'
import { shuffle } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, type FC } from 'react'

import { Node } from '@/fdr'

import { useMachineContext } from '../helpers/useMachineContext'
import { CANCEL, CONTINUE } from '../src/machine'
import { machineAtom } from '../src/states'
import { ActionButton } from './ActionButton'

const Root = styled('div')`
  display: grid;
  grid-template-rows: 1fr min-content 1fr;
`

const Text = styled('div')<{ running: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 440px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  opacity: ${({ running }) => (running ? 0.25 : 1)};
`

const Number: FC = () => {
  const snapshot = useAtomValue(machineAtom)
  const running = snapshot.matches({ connected: 'running' })
  const value = useMachineContext(machineAtom, ({ call }) => call?.value)
  const numbersLeft = useMachineContext(
    machineAtom,
    ({ numbersLeft }) => numbersLeft
  )
  const flips = useMachineContext(machineAtom, ({ flips }) => flips)

  const possibleValues = useMemo(
    () =>
      shuffle(
        new Node(numbersLeft.length)
          .next(...flips)
          .possibleValues()
          .map(index => numbersLeft[index])
      ),
    [numbersLeft, flips]
  )

  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!running) {
      return
    }
    let counter = 0
    const interval = setInterval(
      () => {
        if (ref.current != null) {
          const value = possibleValues[++counter % possibleValues.length]
          ref.current.textContent = `${value}`
        }
      },
      possibleValues.length > 2 ? 1000 / 60 : 1000 / 30
    )
    return () => {
      clearInterval(interval)
    }
  }, [running, possibleValues])

  return (
    <Text running={running}>
      {running ? <span ref={ref}>{'\xa0'}</span> : (value ?? '\xa0')}
    </Text>
  )
}

export const Call: FC = () => {
  const [snapshot, send] = useAtom(machineAtom)

  const handleContinue = useCallback(() => {
    send({ type: CONTINUE })
  }, [send])

  const handleCancel = useCallback(() => {
    send({ type: CANCEL })
  }, [send])

  useEffect(() => {
    const callback = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) {
        return
      }
      switch (event.key) {
        case ' ':
          handleContinue()
          break
        case 'Escape':
          handleCancel()
          break
      }
    }
    window.addEventListener('keydown', callback)
    return () => {
      window.removeEventListener('keydown', callback)
    }
  }, [handleContinue, handleCancel])

  return (
    <Root>
      <div />
      <Number />
      <div>
        <Stack direction='row' spacing={4} justifyContent='center'>
          {snapshot.matches({ connected: 'idle' }) && (
            <ActionButton shortcut='SPACE' onClick={handleContinue}>
              {snapshot.context.callHistory.length > 0 ? 'Continue' : 'Start'}
            </ActionButton>
          )}
          {snapshot.matches({ connected: 'running' }) && (
            <ActionButton shortcut='ESC' onClick={handleCancel}>
              Cancel
            </ActionButton>
          )}
        </Stack>
      </div>
    </Root>
  )
}
