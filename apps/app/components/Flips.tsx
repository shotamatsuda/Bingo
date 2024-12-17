import { styled } from '@mui/material'
import { Stack } from '@mui/system'
import { useAtomValue } from 'jotai'
import { type FC } from 'react'

import { useMachineContext } from '../helpers/useMachineContext'
import { machineAtomAtom } from '../src/states'

const Index = styled('div')`
  font-size: 24px;
  color: ${({ theme }) => theme.palette.secondary.main};
  font-variant-numeric: tabular-nums;
`

const Value = styled('div')<{ focused: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  height: 80px;
  border-bottom: ${({ theme, focused }) =>
    focused ? `solid 8px ${theme.palette.primary.main}` : null};
  color: ${({ theme }) => theme.palette.primary.main};
  background-color: ${({ theme }) => theme.palette.background.paper};
  font-size: 54px;
  font-variant-numeric: tabular-nums slashed-zero;
`

const Flip: FC<{
  index: number
  value?: number
  focused?: boolean
}> = ({ index, value, focused = false }) => (
  <Stack
    spacing={1}
    flexBasis={72}
    flexShrink={1}
    alignItems='center'
    justifyContent='end'
  >
    <Index>{index}</Index>
    <Value focused={focused}>{value}</Value>
  </Stack>
)

export const Flips: FC = () => {
  const machineAtom = useAtomValue(machineAtomAtom)
  const snapshot = useAtomValue(machineAtom)
  const expectedCost = useMachineContext(
    machineAtom,
    ({ expectedCost }) => expectedCost
  )
  const flips = useMachineContext(machineAtom, ({ flips }) => flips)
  return (
    <Stack direction='row' spacing={1} justifyContent='space-evenly'>
      {expectedCost > 0 &&
        [...Array(Math.round(expectedCost))].map((_, index) => (
          <Flip
            key={index}
            index={index + 1}
            value={flips[index]}
            focused={
              snapshot.matches({ connected: 'running' }) &&
              index === flips.length
            }
          />
        ))}
    </Stack>
  )
}
