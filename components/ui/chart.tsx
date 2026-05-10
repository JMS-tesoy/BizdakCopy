"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type TooltipPayloadItem = {
  color?: string
  dataKey?: string | number
  name?: string | number
  value?: string | number
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    hideIndicator?: boolean
    hideLabel?: boolean
    label?: string | number
    payload?: TooltipPayloadItem[]
  }
>(
  (
    {
      active,
      className,
      hideIndicator = false,
      hideLabel = false,
      label,
      payload,
    },
    ref,
  ) => {
    const { config } = useChart()

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] gap-1.5 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-xl",
          className,
        )}
      >
        {!hideLabel && label ? (
          <div className="font-medium">{label}</div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item) => {
            const key = `${item.dataKey ?? item.name ?? ""}`
            const itemConfig = config[key]

            return (
              <div
                key={key}
                className="flex w-full items-center gap-2 text-muted-foreground"
              >
                {!hideIndicator ? (
                  <span
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor:
                        item.color || itemConfig?.color || "var(--chart-2)",
                    }}
                  />
                ) : null}
                <span>{itemConfig?.label ?? item.name ?? key}</span>
                <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                  {item.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
