"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Activity, BarChart3, DollarSign, Percent, Target, TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts"

type ChangeType = "positive" | "negative"
type MetricPoint = { month: string; value: number }
type PnlPoint = { label: string; pnl: number; pnlPercent: number }
type MetricId =
  | "net-pnl"
  | "pnl-percent"
  | "win-rate"
  | "profit-factor"
  | "max-drawdown"
  | "total-trades"
  | "avg-trade"
type ChartType = "area" | "bar"
type PnlRange = "daily" | "weekly" | "monthly"

type PerformanceMetric = {
  id: MetricId
  title: string
  value: string
  change: string
  changeType: ChangeType
  icon: typeof TrendingUp
  chartTitle: string
  chartDescription: string
  chartType: ChartType
  data: MetricPoint[]
  axisFormatter: (value: number) => string
  tooltipFormatter: (value: number) => string
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function makeMetricData(values: number[]) {
  return months.map((month, index) => ({
    month,
    value: values[index],
  }))
}

const percentFormatter = (value: number) => `${value.toFixed(value >= 100 ? 0 : 1)}%`
const dollarFormatter = (value: number) => `$${value.toFixed(2)}`
const compactDollarFormatter = (value: number) => {
  const sign = value < 0 ? "-" : ""
  return `${sign}$${Math.abs(value / 1000).toFixed(0)}k`
}
const countFormatter = (value: number) => value.toLocaleString()
const decimalFormatter = (value: number) => value.toFixed(2)
const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-2)",
  },
  pnl: {
    label: "PnL",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function getStateColor(value: number) {
  if (value > 0) return "var(--chart-2)"
  if (value < 0) return "var(--destructive)"
  return "var(--muted-foreground)"
}

function getStateTextClass(value: number) {
  if (value > 0) return "text-chart-2"
  if (value < 0) return "text-destructive"
  return "text-muted-foreground"
}

function formatSignedValue(value: number, formatter: (value: number) => string) {
  return value > 0 ? `+${formatter(value)}` : formatter(value)
}

const performanceMetrics: PerformanceMetric[] = [
  {
    id: "net-pnl",
    title: "PnL",
    value: "+$12,740",
    change: "+$1,230",
    changeType: "positive",
    icon: DollarSign,
    chartTitle: "Net PnL (2024)",
    chartDescription: "Monthly realized profit and loss from closed trades.",
    chartType: "bar",
    data: makeMetricData([0, 850, 1200, -300, 1200, 1300, 800, 900, -500, 2200, 1400, 4540]),
    axisFormatter: compactDollarFormatter,
    tooltipFormatter: dollarFormatter,
  },
  {
    id: "pnl-percent",
    title: "PnL %",
    value: "+127.4%",
    change: "+12.3%",
    changeType: "positive",
    icon: TrendingUp,
    chartTitle: "PnL % Growth (2024)",
    chartDescription: "Cumulative account growth expressed as percentage return.",
    chartType: "area",
    data: makeMetricData([0, 8.5, 12, 9, 21, 34, 42, 51, 46, 68, 82, 127.4]),
    axisFormatter: percentFormatter,
    tooltipFormatter: percentFormatter,
  },
  {
    id: "win-rate",
    title: "Win Rate",
    value: "68.7%",
    change: "+2.1%",
    changeType: "positive",
    icon: Target,
    chartTitle: "Win Rate Trend (2024)",
    chartDescription: "The percentage of closed trades that ended positive each month.",
    chartType: "area",
    data: makeMetricData([61.2, 64.8, 66.1, 62.7, 67.4, 69.2, 70.1, 68.9, 66.8, 69.7, 71.4, 68.7]),
    axisFormatter: percentFormatter,
    tooltipFormatter: percentFormatter,
  },
  {
    id: "profit-factor",
    title: "Profit Factor",
    value: "2.34",
    change: "+0.12",
    changeType: "positive",
    icon: BarChart3,
    chartTitle: "Profit Factor Trend (2024)",
    chartDescription: "Gross profit divided by gross loss, tracked monthly.",
    chartType: "area",
    data: makeMetricData([1.68, 1.82, 1.94, 1.73, 2.02, 2.12, 2.18, 2.21, 2.05, 2.28, 2.41, 2.34]),
    axisFormatter: decimalFormatter,
    tooltipFormatter: decimalFormatter,
  },
  {
    id: "max-drawdown",
    title: "Max Drawdown",
    value: "12.3%",
    change: "-1.2%",
    changeType: "negative",
    icon: Percent,
    chartTitle: "Max Drawdown (2024)",
    chartDescription: "Peak-to-trough pressure observed during each month.",
    chartType: "area",
    data: makeMetricData([8.1, 9.4, 10.2, 12.8, 11.1, 10.7, 9.8, 11.6, 13.5, 12.9, 11.8, 12.3]),
    axisFormatter: percentFormatter,
    tooltipFormatter: percentFormatter,
  },
  {
    id: "total-trades",
    title: "Total Trades",
    value: "1,247",
    change: "+89",
    changeType: "positive",
    icon: Activity,
    chartTitle: "Monthly Trade Volume",
    chartDescription: "Closed trade count by month across the tracked signal history.",
    chartType: "bar",
    data: makeMetricData([74, 86, 92, 88, 101, 107, 116, 121, 98, 124, 131, 109]),
    axisFormatter: countFormatter,
    tooltipFormatter: countFormatter,
  },
  {
    id: "avg-trade",
    title: "Avg Trade",
    value: "+$18.42",
    change: "+$2.10",
    changeType: "positive",
    icon: TrendingUp,
    chartTitle: "Average Trade Profit",
    chartDescription: "Average realized profit per closed trade each month.",
    chartType: "area",
    data: makeMetricData([9.8, 11.25, 12.64, 10.12, 14.35, 16.18, 17.44, 18.02, 14.92, 19.4, 20.52, 18.42]),
    axisFormatter: dollarFormatter,
    tooltipFormatter: dollarFormatter,
  },
]

const pnlRanges: Record<PnlRange, PnlPoint[]> = {
  daily: [
    { label: "Mon", pnl: 184, pnlPercent: 1.8 },
    { label: "Tue", pnl: -76, pnlPercent: -0.7 },
    { label: "Wed", pnl: 242, pnlPercent: 2.3 },
    { label: "Thu", pnl: 118, pnlPercent: 1.1 },
    { label: "Fri", pnl: 326, pnlPercent: 3.0 },
  ],
  weekly: [
    { label: "W1", pnl: 680, pnlPercent: 6.4 },
    { label: "W2", pnl: 420, pnlPercent: 3.8 },
    { label: "W3", pnl: -210, pnlPercent: -1.9 },
    { label: "W4", pnl: 1230, pnlPercent: 10.7 },
  ],
  monthly: [
    { label: "Jan", pnl: 0, pnlPercent: 0 },
    { label: "Feb", pnl: 850, pnlPercent: 8.5 },
    { label: "Mar", pnl: 1200, pnlPercent: 11.1 },
    { label: "Apr", pnl: -300, pnlPercent: -2.7 },
    { label: "May", pnl: 1200, pnlPercent: 10.8 },
    { label: "Jun", pnl: 1300, pnlPercent: 10.7 },
    { label: "Jul", pnl: 800, pnlPercent: 6.0 },
    { label: "Aug", pnl: 900, pnlPercent: 6.3 },
    { label: "Sep", pnl: -500, pnlPercent: -3.3 },
    { label: "Oct", pnl: 2200, pnlPercent: 15.1 },
    { label: "Nov", pnl: 1400, pnlPercent: 8.3 },
    { label: "Dec", pnl: 4540, pnlPercent: 24.9 },
  ],
}

function getInitialMetric() {
  return performanceMetrics[0]
}

export function PerformanceStats() {
  const [selectedMetricId, setSelectedMetricId] = React.useState<MetricId>(getInitialMetric().id)
  const [selectedPnlRange, setSelectedPnlRange] = React.useState<PnlRange>("daily")
  const selectedMetric =
    performanceMetrics.find((metric) => metric.id === selectedMetricId) ?? getInitialMetric()
  const SelectedIcon = selectedMetric.icon
  const selectedPnlData = pnlRanges[selectedPnlRange]
  const pnlTotal = selectedPnlData.reduce((sum, point) => sum + point.pnl, 0)
  const pnlPercentTotal = selectedPnlData.reduce((sum, point) => sum + point.pnlPercent, 0)

  return (
    <section id="performance" className="section-fade-divider bg-muted/30 px-6 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-semibold md:text-4xl">Live Performance</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Verified trading results updated in real-time. All statistics are from actual trades executed on live
            accounts.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon
            const isSelected = metric.id === selectedMetric.id

            return (
              <button
                key={metric.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedMetricId(metric.id)}
                className={`rounded-xl text-left outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50 ${
                  isSelected
                    ? "bg-card ring-2 ring-primary/30"
                    : "bg-card ring-1 ring-foreground/10 hover:bg-accent/40"
                }`}
              >
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-muted-foreground">{metric.title}</span>
                  </div>
                  <p className="text-xl font-bold">{metric.value}</p>
                  <p className={`text-xs ${metric.changeType === "positive" ? "text-chart-2" : "text-destructive"}`}>
                    {metric.change} this month
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SelectedIcon className="size-5" aria-hidden="true" />
              {selectedMetric.chartTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Select a metric to inspect its trend.</p>
            <p className="text-sm text-muted-foreground">{selectedMetric.chartDescription}</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <PerformanceMetricChart metric={selectedMetric} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-card">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5" aria-hidden="true" />
                  MT5-Style PnL Bars
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Review realized PnL and PnL % by daily, weekly, or monthly periods.
                </p>
              </div>

              <div className="grid grid-cols-3 rounded-lg bg-muted p-1 text-sm">
                {(["daily", "weekly", "monthly"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    aria-pressed={selectedPnlRange === range}
                    onClick={() => setSelectedPnlRange(range)}
                    className={`rounded-md px-3 py-1.5 font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selectedPnlRange === range
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Selected PnL</p>
                <p className={`text-2xl font-bold ${getStateTextClass(pnlTotal)}`}>
                  {formatSignedValue(pnlTotal, dollarFormatter)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Selected PnL %</p>
                <p className={`text-2xl font-bold ${getStateTextClass(pnlPercentTotal)}`}>
                  {formatSignedValue(pnlPercentTotal, percentFormatter)}
                </p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                <BarChart accessibilityLayer data={selectedPnlData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={compactDollarFormatter}
                  />
                  <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const point = payload[0].payload as PnlPoint

                        return (
                          <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                            <p className={`text-sm font-medium ${getStateTextClass(point.pnl)}`}>
                              {formatSignedValue(point.pnl, dollarFormatter)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {point.label} · {formatSignedValue(point.pnlPercent, percentFormatter)}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="pnl" radius={6}>
                    {selectedPnlData.map((point) => (
                      <Cell
                        key={point.label}
                        fill={getStateColor(point.pnl)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function PerformanceMetricChart({ metric }: { metric: PerformanceMetric }) {
  if (metric.chartType === "bar") {
    return (
      <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
        <BarChart accessibilityLayer data={metric.data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={metric.axisFormatter}
          />
          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const value = Number(payload[0].value)
                const month = payload[0].payload.month

                return (
                  <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                    <p className={`text-sm font-medium ${getStateTextClass(value)}`}>
                      {metric.id === "net-pnl"
                        ? formatSignedValue(value, metric.tooltipFormatter)
                        : metric.tooltipFormatter(value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {month} 2024 · {metric.title}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="value" radius={6}>
            {metric.data.map((point) => (
              <Cell
                key={point.month}
                fill={getStateColor(point.value)}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
      <AreaChart data={metric.data}>
        <defs>
          <linearGradient id="performanceMetricGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickFormatter={metric.axisFormatter}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const value = Number(payload[0].value)
              const month = payload[0].payload.month

              return (
                <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                  <p className="text-sm font-medium">{metric.tooltipFormatter(value)}</p>
                  <p className="text-xs text-muted-foreground">
                    {month} 2024 · {metric.title}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill="url(#performanceMetricGradient)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
