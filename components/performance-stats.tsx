"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Activity, BarChart3, DollarSign, Percent, Target, TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts"

type ChangeType = "positive" | "negative"
type MetricPoint = { month: string; value: number }
type PnlPoint = {
  date: string
  pnl: number
  endDate?: string
  label?: string
  detail?: string
}
type ProfitLossPoint = PnlPoint & {
  profit: number
  losses: number
}
type MetricId =
  | "net-pnl"
  | "sample-return"
  | "win-rate"
  | "profit-factor"
  | "max-drawdown"
  | "total-trades"
  | "best-month"
  | "worst-month"
  | "avg-hold"
type ChartType = "area" | "bar"
type PnlRange = "daily" | "weekly" | "monthly" | "three-months" | "six-months"
type PnlChartKey = "profit" | "losses"

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
  profit: {
    label: "Profit",
    color: "var(--chart-2)",
  },
  losses: {
    label: "Losses",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

function getStateColor(value: number) {
  if (value > 0) return "color-mix(in oklab, var(--foreground) 48%, transparent)"
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

const pnlChartOptions: { id: PnlChartKey; label: string; formatter: (value: number) => string }[] = [
  { id: "profit", label: "Profit", formatter: dollarFormatter },
  { id: "losses", label: "Losses", formatter: dollarFormatter },
]

const performanceMetrics: PerformanceMetric[] = [
  {
    id: "net-pnl",
    title: "Sample Net PnL",
    value: "+$12,740",
    change: "+$1,230",
    changeType: "positive",
    icon: DollarSign,
    chartTitle: "Sample Net PnL (2024)",
    chartDescription: "Demo monthly profit and loss for platform preview only.",
    chartType: "bar",
    data: makeMetricData([0, 850, 1200, -300, 1200, 1300, 800, 900, -500, 2200, 1400, 4540]),
    axisFormatter: compactDollarFormatter,
    tooltipFormatter: dollarFormatter,
  },
  {
    id: "sample-return",
    title: "Sample Return",
    value: "+127.4%",
    change: "+12.3%",
    changeType: "positive",
    icon: TrendingUp,
    chartTitle: "Sample Return Preview (2024)",
    chartDescription: "Demo cumulative return for UI preview, not verified live performance.",
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
    chartTitle: "Sample Win Rate Trend (2024)",
    chartDescription: "Demo percentage of closed trades that ended positive each month.",
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
    chartTitle: "Sample Profit Factor Trend (2024)",
    chartDescription: "Demo gross profit divided by gross loss, tracked monthly.",
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
    chartTitle: "Sample Max Drawdown (2024)",
    chartDescription: "Demo peak-to-trough pressure observed during each month.",
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
    chartTitle: "Sample Monthly Trade Volume",
    chartDescription: "Demo closed trade count by month across the sample signal history.",
    chartType: "bar",
    data: makeMetricData([74, 86, 92, 88, 101, 107, 116, 121, 98, 124, 131, 109]),
    axisFormatter: countFormatter,
    tooltipFormatter: countFormatter,
  },
  {
    id: "best-month",
    title: "Best Month",
    value: "+24.9%",
    change: "+9.8%",
    changeType: "positive",
    icon: TrendingUp,
    chartTitle: "Sample Best Month",
    chartDescription: "Demo monthly return values used to preview upside months.",
    chartType: "area",
    data: makeMetricData([0, 8.5, 11.1, -2.7, 10.8, 10.7, 6.0, 6.3, -3.3, 15.1, 8.3, 24.9]),
    axisFormatter: percentFormatter,
    tooltipFormatter: percentFormatter,
  },
  {
    id: "worst-month",
    title: "Worst Month",
    value: "-3.3%",
    change: "-0.6%",
    changeType: "negative",
    icon: Percent,
    chartTitle: "Sample Worst Month",
    chartDescription: "Demo monthly return values used to show downside periods.",
    chartType: "bar",
    data: makeMetricData([0, 8.5, 11.1, -2.7, 10.8, 10.7, 6.0, 6.3, -3.3, 15.1, 8.3, 24.9]),
    axisFormatter: percentFormatter,
    tooltipFormatter: percentFormatter,
  },
  {
    id: "avg-hold",
    title: "Avg Hold",
    value: "18h",
    change: "-2h",
    changeType: "negative",
    icon: Activity,
    chartTitle: "Sample Average Hold Time",
    chartDescription: "Demo average time positions stayed open each month.",
    chartType: "area",
    data: makeMetricData([31, 28, 25, 29, 24, 22, 21, 20, 26, 19, 17, 18]),
    axisFormatter: (value) => `${value.toFixed(0)}h`,
    tooltipFormatter: (value) => `${value.toFixed(0)}h`,
  },
]

const pnlRangeOptions: { id: PnlRange; label: string; barLabel: string }[] = [
  { id: "daily", label: "Daily", barLabel: "daily bars" },
  { id: "weekly", label: "Weekly", barLabel: "weekly bars" },
  { id: "monthly", label: "Monthly", barLabel: "monthly bars" },
  { id: "three-months", label: "3 Months", barLabel: "weekly bars" },
  { id: "six-months", label: "6 Months", barLabel: "weekly bars" },
]

const dateMonthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatDateLabel(date: Date) {
  return `${dateMonthLabels[date.getUTCMonth()]} ${date.getUTCDate()}`
}

function formatIsoDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number)
  return formatDateLabel(new Date(Date.UTC(year, month - 1, day)))
}

function formatDateRangeLabel(startDate: Date, endDate: Date) {
  const startMonth = dateMonthLabels[startDate.getUTCMonth()]
  const endMonth = dateMonthLabels[endDate.getUTCMonth()]
  const startDay = startDate.getUTCDate()
  const endDay = endDate.getUTCDate()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, 2024`
  }

  return `${startMonth} ${startDay}-${endMonth} ${endDay}, 2024`
}

function addUtcDays(date: Date, days: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days))
}

function makeDayBuckets(startMonth: number, startDay: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(2024, startMonth, startDay + index))

    return {
      date: toIsoDate(date),
      label: formatDateLabel(date),
      detail: `${formatDateLabel(date)}, 2024`,
    }
  })
}

function makeWeekBuckets(startMonth: number, startDay: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const startDate = new Date(Date.UTC(2024, startMonth, startDay + index * 7))
    const endDate = addUtcDays(startDate, 6)

    return {
      date: toIsoDate(startDate),
      endDate: toIsoDate(endDate),
      label: formatDateLabel(startDate),
      detail: formatDateRangeLabel(startDate, endDate),
    }
  })
}

function makeMonthBuckets(startMonth: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const monthIndex = startMonth + index
    const monthLabel = dateMonthLabels[monthIndex % 12]
    const year = 2024 + Math.floor(monthIndex / 12)
    const startDate = new Date(Date.UTC(year, monthIndex % 12, 1))

    return {
      date: toIsoDate(startDate),
      label: monthLabel,
      detail: `${monthLabel} ${year}`,
    }
  })
}

const dailyPnlBuckets = makeDayBuckets(11, 16, 7)
const weeklyPnlBuckets = makeWeekBuckets(10, 4, 8)
const monthlyPnlBuckets = makeMonthBuckets(0, 12)
const threeMonthPnlBuckets = makeWeekBuckets(9, 7, 13)
const sixMonthPnlBuckets = makeWeekBuckets(6, 1, 26)

const pnlAxisConfig: Record<PnlRange, { formatter?: (value: string) => string }> = {
  daily: {
    formatter: formatIsoDateLabel,
  },
  weekly: {
    formatter: formatIsoDateLabel,
  },
  monthly: {
    formatter: (value) => {
      const [year, month] = value.split("-").map(Number)
      return dateMonthLabels[new Date(Date.UTC(year, month - 1, 1)).getUTCMonth()]
    },
  },
  "three-months": {
    formatter: formatIsoDateLabel,
  },
  "six-months": {
    formatter: formatIsoDateLabel,
  },
}

function makePnlPoints(
  buckets: { date: string; endDate?: string; label?: string; detail?: string }[],
  pnlValues: number[],
) {
  return buckets.map((bucket, index) => ({
    date: bucket.date,
    endDate: bucket.endDate,
    label: bucket.label,
    detail: bucket.detail,
    pnl: pnlValues[index],
  }))
}

const pnlRanges: Record<PnlRange, PnlPoint[]> = {
  daily: makePnlPoints(
    dailyPnlBuckets,
    [184, -76, 242, 118, 326, 92, 64],
  ),
  weekly: makePnlPoints(
    weeklyPnlBuckets,
    [640, -180, 840, 620, 1030, -260, 1180, 1320],
  ),
  monthly: makePnlPoints(
    monthlyPnlBuckets,
    [0, 850, 1200, -300, 1200, 1300, 800, 900, -500, 2200, 1400, 4540],
  ),
  "three-months": makePnlPoints(
    threeMonthPnlBuckets,
    [320, -180, 540, 410, 620, -260, 760, 480, 690, 820, -310, 980, 1120],
  ),
  "six-months": makePnlPoints(
    sixMonthPnlBuckets,
    [
      210, 340, -160, 480, 520, 390, -230, 610, 470, 550, 680, -310, 740,
      620, 810, -280, 930, 760, 870, 1020, -420, 1120, 980, 1250, 1180, 1420,
    ],
  ),
}

const defaultMetricId: MetricId = "max-drawdown"
const defaultPnlRange: PnlRange = "six-months"

function getInitialMetric() {
  return performanceMetrics.find((metric) => metric.id === defaultMetricId) ?? performanceMetrics[0]
}

export function PerformanceStats() {
  const [selectedMetricId, setSelectedMetricId] = React.useState<MetricId>(getInitialMetric().id)
  const [selectedPnlRange, setSelectedPnlRange] = React.useState<PnlRange>(defaultPnlRange)
  const [activePnlChart, setActivePnlChart] = React.useState<PnlChartKey>("profit")
  const selectedMetric =
    performanceMetrics.find((metric) => metric.id === selectedMetricId) ?? getInitialMetric()
  const SelectedIcon = selectedMetric.icon
  const selectedPnlData = pnlRanges[selectedPnlRange]
  const selectedPnlAxis = pnlAxisConfig[selectedPnlRange]
  const selectedPnlRangeOption =
    pnlRangeOptions.find((range) => range.id === selectedPnlRange) ?? pnlRangeOptions[pnlRangeOptions.length - 1]
  const selectedPnlRangeLabel = selectedPnlRangeOption.label
  const profitLossData = React.useMemo<ProfitLossPoint[]>(
    () =>
      selectedPnlData.map((point) => ({
        ...point,
        profit: Math.max(point.pnl, 0),
        losses: Math.min(point.pnl, 0),
      })),
    [selectedPnlData],
  )
  const pnlTotals = React.useMemo(
    () => ({
      profit: profitLossData.reduce((sum, point) => sum + point.profit, 0),
      losses: profitLossData.reduce((sum, point) => sum + point.losses, 0),
    }),
    [profitLossData],
  )
  const activePnlOption = pnlChartOptions.find((option) => option.id === activePnlChart) ?? pnlChartOptions[0]

  return (
    <section id="performance" className="section-fade-divider bg-muted/30 px-6 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-semibold md:text-4xl">Performance Preview</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Demo trading results for platform preview. Replace these sample figures with verified OKX account data before
            public launch. Past performance does not guarantee future results.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-9">
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
                    {metric.change} sample month
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

        <Card className="mt-6 bg-card py-0">
          <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5" aria-hidden="true" />
                Sample OKX PnL Bars
              </CardTitle>
              <CardDescription>
                Showing {activePnlOption.label.toLowerCase()} as {selectedPnlRangeOption.barLabel} for the{" "}
                {selectedPnlRangeLabel.toLowerCase()} view.
              </CardDescription>
            </div>
            <div className="grid grid-cols-2 border-t sm:border-l sm:border-t-0">
              {pnlChartOptions.map((option) => {
                const isActive = activePnlChart === option.id
                const totalValue = pnlTotals[option.id]

                return (
                  <button
                    key={option.id}
                    type="button"
                    data-active={isActive}
                    aria-pressed={isActive}
                    className="relative z-30 flex min-w-[150px] flex-1 flex-col justify-center gap-1 border-l px-6 py-4 text-left first:border-l-0 transition-colors data-[active=true]:bg-muted/50 sm:px-8 sm:py-6"
                    onClick={() => setActivePnlChart(option.id)}
                  >
                    <span className="text-xs text-muted-foreground">{option.label}</span>
                    <span className={`text-lg font-bold leading-none sm:text-3xl ${getStateTextClass(totalValue)}`}>
                      {formatSignedValue(totalValue, option.formatter)}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardHeader>
          <CardContent className="px-4 py-6 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span className="w-fit rounded-md border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
                {selectedPnlRangeLabel} · {selectedPnlRangeOption.barLabel}
              </span>
              <div className="grid grid-cols-2 rounded-lg bg-muted p-1 text-sm sm:grid-cols-3 lg:grid-cols-5">
                {pnlRangeOptions.map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    aria-pressed={selectedPnlRange === range.id}
                    onClick={() => setSelectedPnlRange(range.id)}
                    className={`rounded-md px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selectedPnlRange === range.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[320px] w-full rounded-xl border border-border bg-foreground/[0.035] p-3 dark:bg-background/35 sm:p-4">
              <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                <BarChart
                  accessibilityLayer
                  data={profitLossData}
                  barCategoryGap="32%"
                  margin={{
                    left: 8,
                    right: 12,
                    top: 8,
                    bottom: 24,
                  }}
                >
                  <CartesianGrid vertical={false} strokeOpacity={0.36} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    minTickGap={0}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    tickFormatter={selectedPnlAxis.formatter}
                    angle={selectedPnlRange === "daily" ? 0 : -35}
                    textAnchor={selectedPnlRange === "daily" ? "middle" : "end"}
                    height={52}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={compactDollarFormatter}
                    width={46}
                  />
                  <ReferenceLine y={0} stroke="var(--border)" strokeOpacity={0.7} />
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const point = payload[0].payload as ProfitLossPoint
                        const activeValue = point[activePnlChart]

                        return (
                          <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                            <p className={`text-sm font-medium ${getStateTextClass(activeValue)}`}>
                              {formatSignedValue(activeValue, activePnlOption.formatter)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {point.detail ?? point.label} · {activePnlOption.label}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey={activePnlChart} fill={`var(--color-${activePnlChart})`} radius={[8, 8, 8, 8]}>
                    {profitLossData.map((point) => (
                      <Cell
                        key={point.label}
                        fill={getStateColor(point[activePnlChart])}
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
