import { styled } from '@mui/material'
import { motion, useIsomorphicLayoutEffect } from 'framer-motion'
import { useState, type FC, type ReactNode } from 'react'
import { useWindowSize } from 'react-use'

const Root = styled(motion.div, {
  shouldForwardProp: prop => prop !== 'width' && prop !== 'height'
})<{
  width: number
  height: number
}>`
  width: ${({ width }) => `${width}px`};
  height: ${({ height }) => `${height}px`};
  transform-origin: 0 0;
  opacity: 0;
`

export interface ScreenProps {
  intrinsicWidth?: number
  intrinsicHeight?: number
  children?: ReactNode
}

export const Screen: FC<ScreenProps> = ({
  intrinsicWidth = 1920,
  intrinsicHeight = 1080,
  children
}) => {
  const { width, height } = useWindowSize()
  const scale = Math.min(width / intrinsicWidth, height / intrinsicHeight)
  const x = (width - intrinsicWidth * scale) / 2
  const y = (height - intrinsicHeight * scale) / 2

  const [ready, setReady] = useState(false)
  useIsomorphicLayoutEffect(() => {
    setReady(true)
  }, [])

  return (
    <Root
      width={intrinsicWidth}
      height={intrinsicHeight}
      {...(ready && {
        style: {
          transform: `translate(${x}px, ${y}px) scale(${scale}, ${scale})`
        }
      })}
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      {children}
    </Root>
  )
}
