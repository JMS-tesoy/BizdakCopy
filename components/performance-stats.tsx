"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Activity, BarChart3, DollarSign, Percent, Target, TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts"

type ChangeType = "positive" | "negative"
type MetricPoint = { month: string; value: number }
type PnlPoint = {
  date: string
  pnl: number
  pnlPercent: number
  endDate?: string
  label?: string
  detail?: string
}
type MetricId =
  | "net-pnl"
  | "pnl-percent"
  | "win-rate"
  | "profit-factor"
  | "max-drawdown"
  | "total-trades"
  | "avg-trade"
type ChartType = "area" | "bar"
type PnlRange = "daily" | "weekly" | "monthly" | "three-months" | "six-months" | "yearly"

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

const pnlRangeOptions: { id: PnlRange; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "three-months", label: "3 Months" },
  { id: "six-months", label: "6 Months" },
  { id: "yearly", label: "Yearly" },
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
const yearlyPnlBuckets = makeWeekBuckets(0, 1, 52)

const pnlAxisConfig: Record<
  PnlRange,
  { ticks: string[]; formatter?: (value: string) => string }
> = {
  daily: {
    ticks: [dailyPnlBuckets[0].date, dailyPnlBuckets[2].date, dailyPnlBuckets[4].date, dailyPnlBuckets[6].date],
    formatter: formatIsoDateLabel,
  },
  weekly: {
    ticks: [weeklyPnlBuckets[0].date, weeklyPnlBuckets[2].date, weeklyPnlBuckets[4].date, weeklyPnlBuckets[7].date],
    formatter: formatIsoDateLabel,
  },
  monthly: {
    ticks: [monthlyPnlBuckets[0].date, monthlyPnlBuckets[3].date, monthlyPnlBuckets[6].date, monthlyPnlBuckets[9].date, monthlyPnlBuckets[11].date],
    formatter: (value) => {
      const [year, month] = value.split("-").map(Number)
      return dateMonthLabels[new Date(Date.UTC(year, month - 1, 1)).getUTCMonth()]
    },
  },
  "three-months": {
    ticks: [threeMonthPnlBuckets[0].date, threeMonthPnlBuckets[4].date, threeMonthPnlBuckets[8].date, threeMonthPnlBuckets[12].date],
    formatter: formatIsoDateLabel,
  },
  "six-months": {
    ticks: [sixMonthPnlBuckets[0].date, sixMonthPnlBuckets[6].date, sixMonthPnlBuckets[12].date, sixMonthPnlBuckets[19].date, sixMonthPnlBuckets[25].date],
    formatter: formatIsoDateLabel,
  },
  yearly: {
    ticks: [
      yearlyPnlBuckets[0].date,
      yearlyPnlBuckets[8].date,
      yearlyPnlBuckets[17].date,
      yearlyPnlBuckets[26].date,
      yearlyPnlBuckets[35].date,
      yearlyPnlBuckets[44].date,
      yearlyPnlBuckets[51].date,
    ],
    formatter: (value) =>
      ({
        [yearlyPnlBuckets[0].date]: "Jan",
        [yearlyPnlBuckets[8].date]: "Mar",
        [yearlyPnlBuckets[17].date]: "May",
        [yearlyPnlBuckets[26].date]: "Jul",
        [yearlyPnlBuckets[35].date]: "Sep",
        [yearlyPnlBuckets[44].date]: "Nov",
        [yearlyPnlBuckets[51].date]: "Dec",
      })[value] ?? value,
  },
}

function makePnlPoints(
  buckets: { date: string; endDate?: string; label?: string; detail?: string }[],
  pnlValues: number[],
  percentValues: number[],
) {
  return buckets.map((bucket, index) => ({
    date: bucket.date,
    endDate: bucket.endDate,
    label: bucket.label,
    detail: bucket.detail,
    pnl: pnlValues[index],
    pnlPercent: percentValues[index],
  }))
}

const pnlRanges: Record<PnlRange, PnlPoint[]> = {
  daily: makePnlPoints(
    dailyPnlBuckets,
    [184, -76, 242, 118, 326, 92, 64],
    [1.8, -0.7, 2.3, 1.1, 3.0, 0.8, 0.6],
  ),
  weekly: makePnlPoints(
    weeklyPnlBuckets,
    [640, -180, 840, 620, 1030, -260, 1180, 1320],
    [5.8, -1.4, 7.2, 5.1, 8.4, -1.9, 8.8, 9.5],
  ),
  monthly: makePnlPoints(
    monthlyPnlBuckets,
    [0, 850, 1200, -300, 1200, 1300, 800, 900, -500, 2200, 1400, 4540],
    [0, 8.5, 11.1, -2.7, 10.8, 10.7, 6.0, 6.3, -3.3, 15.1, 8.3, 24.9],
  ),
  "three-months": makePnlPoints(
    threeMonthPnlBuckets,
    [320, -180, 540, 410, 620, -260, 760, 480, 690, 820, -310, 980, 1120],
    [2.6, -1.4, 4.3, 3.1, 4.7, -1.9, 5.2, 3.3, 4.6, 5.1, -2.0, 5.8, 6.4],
  ),
  "six-months": makePnlPoints(
    sixMonthPnlBuckets,
    [
      210, 340, -160, 480, 520, 390, -230, 610, 470, 550, 680, -310, 740,
      620, 810, -280, 930, 760, 870, 1020, -420, 1120, 980, 1250, 1180, 1420,
    ],
    [
      1.5, 2.4, -1.1, 3.2, 3.5, 2.6, -1.5, 4.0, 3.0, 3.4, 4.1, -1.8,
      4.3, 3.5, 4.4, -1.4, 4.8, 3.7, 4.1, 4.6, -1.8, 4.9, 4.0, 4.8,
      4.3, 5.0,
    ],
  ),
  yearly: makePnlPoints(
    yearlyPnlBuckets,
    [
      120, 180, -90, 260, 310, 240, -130, 360, 280, 330, 410, -170, 450,
      380, 510, -160, 560, 420, 490, 610, -220, 650, 580, 720, 690, 760,
      -240, 820, 700, 780, 860, -310, 920, 830, 970, 1040, -280, 1120, 980,
      1160, 1250, -360, 1320, 1190, 1410, 1500, -420, 1580, 1460, 1660, 1740,
      1890,
    ],
    [
      0.8, 1.2, -0.6, 1.7, 2.0, 1.5, -0.8, 2.2, 1.7, 2.0, 2.4, -0.9,
      2.5, 2.0, 2.6, -0.8, 2.7, 2.0, 2.2, 2.6, -0.9, 2.7, 2.3, 2.8, 2.6,
      2.8, -0.8, 2.9, 2.4, 2.6, 2.8, -0.9, 3.0, 2.6, 3.0, 3.1, -0.8,
      3.2, 2.8, 3.2, 3.3, -0.9, 3.4, 3.0, 3.5, 3.6, -1.0, 3.7, 3.3, 3.8,
      3.9, 4.1,
    ],
  ),
}

const defaultMetricId: MetricId = "max-drawdown"
const defaultPnlRange: PnlRange = "yearly"

function getInitialMetric() {
  return performanceMetrics.find((metric) => metric.id === defaultMetricId) ?? performanceMetrics[0]
}

export function PerformanceStats() {
  const [selectedMetricId, setSelectedMetricId] = React.useState<MetricId>(getInitialMetric().id)
  const [selectedPnlRange, setSelectedPnlRange] = React.useState<PnlRange>(defaultPnlRange)
  const selectedMetric =
    performanceMetrics.find((metric) => metric.id === selectedMetricId) ?? getInitialMetric()
  const SelectedIcon = selectedMetric.icon
  const selectedPnlData = pnlRanges[selectedPnlRange]
  const selectedPnlAxis = pnlAxisConfig[selectedPnlRange]
  const selectedPnlRangeLabel =
    pnlRangeOptions.find((range) => range.id === selectedPnlRange)?.label ?? "Yearly"
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
                  OKX PnL Bars
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Review realized PnL and PnL % by short-term, medium-term, or yearly periods.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md border border-border bg-background/60 px-2.5 py-1 text-muted-foreground">
                    {selectedPnlRangeLabel} summary
                  </span>
                  <span className={`rounded-md border border-border bg-background/60 px-2.5 py-1 font-medium ${getStateTextClass(pnlTotal)}`}>
                    {formatSignedValue(pnlTotal, dollarFormatter)}
                  </span>
                  <span className={`rounded-md border border-border bg-background/60 px-2.5 py-1 font-medium ${getStateTextClass(pnlPercentTotal)}`}>
                    {formatSignedValue(pnlPercentTotal, percentFormatter)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 rounded-lg bg-muted p-1 text-sm sm:grid-cols-3 lg:grid-cols-6">
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
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                <BarChart accessibilityLayer data={selectedPnlData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    minTickGap={16}
                    ticks={selectedPnlAxis.ticks}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={selectedPnlAxis.formatter}
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
                              {point.detail ?? point.label} · {formatSignedValue(point.pnlPercent, percentFormatter)}
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
