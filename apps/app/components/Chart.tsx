import { useTheme } from '@mui/material'
import {
  Chart as ChartJS,
  type ChartConfiguration,
  type ChartType,
  type DefaultDataPoint,
  type Plugin
} from 'chart.js/auto'
import annotationPlugin from 'chartjs-plugin-annotation'
import { isEqual, merge, omit } from 'lodash'
import { useEffect, useRef, useState } from 'react'

ChartJS.register(annotationPlugin)

const legendSpacingPlugin: Plugin = {
  id: 'legendSpacingPlugin',
  beforeInit(chart: any) {
    const originalFit = chart.legend.fit
    chart.legend.fit = function () {
      originalFit.bind(chart.legend)()
      this.height += 10
    }
  }
}

const canvasBackgroundPlugin: Plugin = {
  id: 'canvasBackgroundPlugin',
  beforeDraw: chart => {
    // const context = chart.ctx
    // context.save()
    // context.globalCompositeOperation = 'destination-over'
    // context.fillStyle = '#ffffff'
    // context.fillRect(0, 0, chart.width, chart.height)
    // context.restore()
  }
}

const defaultConfig: Partial<ChartConfiguration> = {
  options: {
    animation: false,
    scales: {
      x: {
        type: 'linear',
        grid: {
          drawOnChartArea: false
        }
      },
      y: {
        type: 'linear',
        grid: {
          drawOnChartArea: false
        }
      }
    },
    datasets: {
      line: {
        borderWidth: 1.5,
        pointRadius: 0
      }
    },
    plugins: {
      legend: {
        labels: {
          padding: 16,
          boxWidth: 32,
          boxHeight: 0
        }
      }
    }
  },
  plugins: [canvasBackgroundPlugin, legendSpacingPlugin]
}

function updateChart<TType extends ChartType, TData, TLabel>(
  chart: ChartJS<TType, TData, TLabel> | null | undefined,
  config: ChartConfiguration<TType, TData, TLabel>
): void {
  if (chart != null) {
    chart.data = { datasets: [] }
    Object.assign(
      chart.config,
      omit(merge({}, defaultConfig, config), 'plugins')
    )
    chart.update()
  }
}

export const chartColors = {
  blue: 'rgb(54, 162, 235)',
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
}

export function Chart<
  TType extends ChartType = ChartType,
  TData = DefaultDataPoint<TType>,
  TLabel = unknown
>(config: ChartConfiguration<TType, TData, TLabel>): JSX.Element {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const chartRef = useRef<ChartJS<TType, TData, TLabel>>()

  const configRef = useRef(config)
  useEffect(() => {
    if (canvas == null) {
      return
    }
    const chart = new ChartJS(
      canvas,
      merge({}, defaultConfig, configRef.current)
    )
    chartRef.current = chart
    return () => {
      chart.destroy()
    }
  }, [canvas])

  useEffect(() => {
    if (!isEqual(config, configRef.current)) {
      updateChart(chartRef.current, config)
      configRef.current = config
    }
  })

  const theme = useTheme()
  useEffect(() => {
    ChartJS.defaults.font.family = theme.typography.fontFamily
    ChartJS.defaults.color = theme.palette.primary.main
    ChartJS.defaults.borderColor = theme.palette.secondary.main
  }, [theme])

  useEffect(() => {
    updateChart(chartRef.current, configRef.current)
  }, [theme])

  return <canvas ref={setCanvas} />
}
