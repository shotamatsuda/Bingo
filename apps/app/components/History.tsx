import { css, styled } from '@mui/material'
import { useMemo, type FC } from 'react'

import { useMachineContext } from '../helpers/useMachineContext'
import { machineAtomAtom } from '../src/states'
import { useAtomValue } from 'jotai'

const ItemRoot = styled('div')<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: 50%;
  color: ${({ selected, theme }) =>
    selected ? theme.palette.background.default : theme.palette.primary.main};
  background-color: ${({ selected, theme }) =>
    selected ? theme.palette.primary.main : theme.palette.background.paper};
  font-size: 30px;
  font-variant-numeric: tabular-nums;
`

export const Item: FC<{ value: number }> = ({ value }) => {
  const machineAtom = useAtomValue(machineAtomAtom)
  const callHistory = useMachineContext(
    machineAtom,
    ({ callHistory }) => callHistory
  )
  const item = useMemo(
    () => callHistory.find(item => item.value === value),
    [value, callHistory]
  )
  return <ItemRoot selected={item != null}>{value}</ItemRoot>
}

const Root = styled('div')`
  display: grid;
  align-content: center;
  justify-content: center;
  height: 100%;
`

export interface HistoryProps {
  columns?: number
  size?: number
  gutter?: number
}

export const History: FC<HistoryProps> = ({
  columns = 6,
  size = 60,
  gutter = 12
}) => {
  return (
    <Root
      css={css`
        grid-template-columns: repeat(${columns}, ${size}px);
        grid-column-gap: ${gutter}px;
        grid-row-gap: ${gutter}px;
      `}
    >
      {[...Array(75)]
        .map((_, index) => index + 1)
        .map(value => (
          <Item key={value} value={value} />
        ))}
    </Root>
  )
}
