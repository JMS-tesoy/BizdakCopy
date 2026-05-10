"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BarChart3, Percent, Target, TrendingUp } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type ChangeType = "positive" | "negative"
type MetricPoint = { month: string; value: number }
type MetricId =
  | "total-return"
  | "win-rate"
  | "profit-factor"
  | "max-drawdown"
  | "total-trades"
  | "avg-trade"

type PerformanceMetric = {
  id: MetricId
  title: string
  value: string
  change: string
  changeType: ChangeType
  icon: typeof TrendingUp
  chartTitle: string
  chartDescription: string
  valuePrefix?: string
  valueSuffix?: string
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
const countFormatter = (value: number) => value.toLocaleString()
const decimalFormatter = (value: number) => value.toFixed(2)

const performanceMetrics: PerformanceMetric[] = [
  {
    id: "total-return",
    title: "Total Return",
    value: "+127.4%",
    change: "+12.3%",
    changeType: "positive",
    icon: TrendingUp,
    chartTitle: "Cumulative Return (2024)",
    chartDescription: "Month-by-month account growth based on the public performance track record.",
    valueSuffix: "%",
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
    valueSuffix: "%",
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
    valueSuffix: "%",
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
    valuePrefix: "$",
    data: makeMetricData([9.8, 11.25, 12.64, 10.12, 14.35, 16.18, 17.44, 18.02, 14.92, 19.4, 20.52, 18.42]),
    axisFormatter: dollarFormatter,
    tooltipFormatter: dollarFormatter,
  },
]

function getInitialMetric() {
  return performanceMetrics[0]
}

export function PerformanceStats() {
  const [selectedMetricId, setSelectedMetricId] = React.useState<MetricId>(getInitialMetric().id)
  const selectedMetric =
    performanceMetrics.find((metric) => metric.id === selectedMetricId) ?? getInitialMetric()
  const SelectedIcon = selectedMetric.icon

  return (
    <section id="performance" className="bg-muted/30 px-6 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Live Performance</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Verified trading results updated in real-time. All statistics are from actual trades executed on live
            accounts.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
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
              <SelectedIcon className="h-5 w-5" aria-hidden="true" />
              {selectedMetric.chartTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Select a metric to inspect its trend.</p>
            <p className="text-sm text-muted-foreground">{selectedMetric.chartDescription}</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedMetric.data}>
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
                    tickFormatter={selectedMetric.axisFormatter}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const value = Number(payload[0].value)
                        const month = payload[0].payload.month

                        return (
                          <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                            <p className="text-sm font-medium">{selectedMetric.tooltipFormatter(value)}</p>
                            <p className="text-xs text-muted-foreground">
                              {month} 2024 · {selectedMetric.title}
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
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
