import { ChevronRight } from '@mui/icons-material'
import { Button, Stack, styled, type ButtonProps } from '@mui/material'
import { type FC } from 'react'

const Key = styled('span')`
  color: ${({ theme }) => theme.palette.secondary.main};
`

export interface ActionButtonProps extends ButtonProps {
  shortcut?: string
}

export const ActionButton: FC<ActionButtonProps> = ({
  shortcut,
  children,
  ...props
}) => (
  <Button size='large' startIcon={<ChevronRight />} {...props}>
    <Stack direction='row' spacing={2}>
      <span>{children}</span>
      {shortcut != null && <Key>{shortcut}</Key>}
    </Stack>
  </Button>
)
