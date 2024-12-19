/// <reference types="w3c-web-serial" />

import {
  Button,
  Checkbox,
  Dialog,
  dialogClasses,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  styled,
  TextField,
  Typography
} from '@mui/material'
import { Stack } from '@mui/system'
import { atom, useAtom, useSetAtom } from 'jotai'
import { without } from 'lodash'
import { useCallback, useEffect, type ChangeEvent, type FC } from 'react'

import { createInternalReceiver, createSerialReceiver } from '../src/receivers'
import {
  boardCountAtom,
  openSettingsAtom,
  receiverAtom,
  restoreLastSessionAtom
} from '../src/states'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`.${dialogClasses.paper}`]: {
    backgroundColor: theme.palette.background.default
  }
}))

const serialPortsAtom = atom<SerialPort[]>([])

const SerialPortItem: FC<{
  port: SerialPort
  onComplete?: () => void
}> = ({ port, onComplete }) => {
  const setReceiver = useSetAtom(receiverAtom)
  const handleUse = useCallback(() => {
    setReceiver(createSerialReceiver(port))
    onComplete?.()
  }, [port, onComplete, setReceiver])

  const setSerialPorts = useSetAtom(serialPortsAtom)
  const handleRemove = useCallback(() => {
    ;(async () => {
      await port.forget()
      setSerialPorts(ports => without(ports, port))
    })().catch(error => {
      console.error(error)
    })
  }, [port, setSerialPorts])

  return (
    <ListItem
      secondaryAction={
        <Stack direction='row' spacing={1}>
          <Button variant='outlined' onClick={handleRemove}>
            Remove
          </Button>
          <Button variant='contained' onClick={handleUse}>
            Use
          </Button>
        </Stack>
      }
    >
      <ListItemText>
        <Stack direction='row' spacing={1}>
          <span>Serial port</span>
          <Typography display='inline' color='textSecondary'>
            {port.getInfo().usbVendorId} - {port.getInfo().usbProductId}
          </Typography>
        </Stack>
      </ListItemText>
    </ListItem>
  )
}

const InternalItem: FC<{
  onComplete?: () => void
}> = ({ onComplete }) => {
  const setReceiver = useSetAtom(receiverAtom)
  const handleUse = useCallback(() => {
    setReceiver(createInternalReceiver())
    onComplete?.()
  }, [onComplete, setReceiver])

  return (
    <ListItem
      secondaryAction={
        <Stack direction='row' spacing={1}>
          <Button variant='contained' onClick={handleUse}>
            Use
          </Button>
        </Stack>
      }
    >
      <ListItemText>
        <Stack direction='row' spacing={1}>
          <span>Internal</span>
          <Typography display='inline' color='textSecondary'>
            For demo
          </Typography>
        </Stack>
      </ListItemText>
    </ListItem>
  )
}

export const Settings: FC = () => {
  const [ports, setPorts] = useAtom(serialPortsAtom)

  useEffect(() => {
    ;(async () => {
      const ports = await navigator.serial.getPorts()
      setPorts(ports)
    })().catch(error => {
      console.error(error)
    })
  }, [setPorts])

  useEffect(() => {
    const handleConnect = (event: Event): void => {
      const port = event.target
      if (port instanceof SerialPort) {
        setPorts(ports => (!ports.includes(port) ? [...ports, port] : ports))
      }
    }

    const handleDisconnect = (event: Event): void => {
      const port = event.target
      if (port instanceof SerialPort) {
        setPorts(ports => without(ports, port))
      }
    }

    navigator.serial.addEventListener('connect', handleConnect)
    navigator.serial.addEventListener('disconnect', handleDisconnect)
    return () => {
      navigator.serial.removeEventListener('connect', handleConnect)
      navigator.serial.removeEventListener('disconnect', handleDisconnect)
    }
  }, [setPorts])

  const handleClick = useCallback(() => {
    ;(async () => {
      const port = await navigator.serial.requestPort()
      setPorts(ports => (!ports.includes(port) ? [...ports, port] : ports))
    })().catch(error => {
      console.error(error)
    })
  }, [setPorts])

  const [boardCount, setBoardCount] = useAtom(boardCountAtom)
  const handleBoardCountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = +event.target.value
      if (!isNaN(value) && value > 0) {
        setBoardCount(value)
      }
    },
    [setBoardCount]
  )

  const [restoreLastSession, setRestoreLastSession] = useAtom(
    restoreLastSessionAtom
  )
  const handleRestoreLastSession = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setRestoreLastSession(event.target.checked)
    },
    [setRestoreLastSession]
  )

  const [open, setOpen] = useAtom(openSettingsAtom)
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <List disablePadding sx={{ width: 400 }}>
          <ListItem
            secondaryAction={
              <TextField
                type='number'
                size='small'
                value={boardCount}
                onChange={handleBoardCountChange}
                sx={{ width: 100 }}
              />
            }
          >
            <ListItemText>Number of boards</ListItemText>
          </ListItem>
          <ListSubheader sx={{ background: 'none' }}>Session</ListSubheader>
          <ListItem sx={{ paddingTop: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={restoreLastSession}
                  onChange={handleRestoreLastSession}
                />
              }
              label='Restore last session'
            />
          </ListItem>
          <ListSubheader sx={{ background: 'none' }}>Receiver</ListSubheader>
          <List disablePadding>
            <InternalItem onComplete={handleClose} />
            {ports.map((port, index) => (
              <SerialPortItem
                key={index}
                port={port}
                onComplete={handleClose}
              />
            ))}
          </List>
          <ListItem>
            <Button variant='outlined' fullWidth onClick={handleClick}>
              Add another
            </Button>
          </ListItem>
        </List>
      </DialogContent>
    </StyledDialog>
  )
}
