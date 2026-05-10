"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

const themeOptions = ["system", "light", "dark"] as const
type ThemeOption = (typeof themeOptions)[number]

const themeLabels: Record<ThemeOption, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
}

function normalizeTheme(theme: string | undefined): ThemeOption {
  return themeOptions.find((option) => option === theme) ?? "system"
}

function subscribeToMount(onStoreChange: () => void) {
  queueMicrotask(onStoreChange)

  return () => {}
}

function useIsMounted() {
  return React.useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false
  )
}

function getNextTheme(theme: ThemeOption) {
  const currentIndex = themeOptions.findIndex((option) => option === theme)
  return themeOptions[(currentIndex + 1) % themeOptions.length]
}

function ThemeIcon({ theme }: { theme: string | undefined }) {
  if (theme === "light") {
    return <Sun className="size-4" aria-hidden="true" />
  }

  if (theme === "dark") {
    return <Moon className="size-4" aria-hidden="true" />
  }

  return <Monitor className="size-4" aria-hidden="true" />
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  const activeTheme = isMounted ? normalizeTheme(theme) : "system"
  const nextTheme = getNextTheme(activeTheme)
  const label = `Theme: ${themeLabels[activeTheme]}. Click to switch to ${themeLabels[nextTheme]}.`

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(nextTheme)}
    >
      <ThemeIcon theme={activeTheme} />
    </Button>
  )
}
