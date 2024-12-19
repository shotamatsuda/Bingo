/// <reference types="w3c-web-serial" />

import {
  Button,
  Dialog,
  dialogClasses,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  styled,
  TextField
} from '@mui/material'
import { atom, useAtom, useSetAtom } from 'jotai'
import { without } from 'lodash'
import { useCallback, useEffect, type ChangeEvent, type FC } from 'react'

import { boardCountAtom, openSetupAtom, serialPortAtom } from '../src/states'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`.${dialogClasses.paper}`]: {
    backgroundColor: theme.palette.background.default
  }
}))

const serialPortsAtom = atom<SerialPort[]>([])

const Item: FC<{
  port: SerialPort
  onComplete?: () => void
}> = ({ port, onComplete }) => {
  const setSerialPort = useSetAtom(serialPortAtom)
  const handleUse = useCallback(() => {
    setSerialPort(port)
    onComplete?.()
  }, [port, onComplete, setSerialPort])

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
        <>
          <Button onClick={handleUse}>Use</Button>
          <Button onClick={handleRemove}>Remove</Button>
        </>
      }
    >
      <ListItemText>
        Vendor: {port.getInfo().usbVendorId}, Product:{' '}
        {port.getInfo().usbProductId}
      </ListItemText>
    </ListItem>
  )
}

export const Setup: FC = () => {
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

  const [open, setOpen] = useAtom(openSetupAtom)
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
          <ListItem>
            <ListItemText>Serial port</ListItemText>
          </ListItem>
          <List dense disablePadding>
            {ports.map((port, index) => (
              <Item key={index} port={port} onComplete={handleClose} />
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
