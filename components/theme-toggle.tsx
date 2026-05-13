"use client"

import * as React from "react"
import { Check, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

function ThemeIcon({ theme }: { theme: string | undefined }) {
  if (theme === "light") {
    return <Sun aria-hidden="true" />
  }

  if (theme === "dark") {
    return <Moon aria-hidden="true" />
  }

  return <Monitor aria-hidden="true" />
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  const activeTheme = isMounted ? normalizeTheme(theme) : "system"
  const label = `Theme: ${themeLabels[activeTheme]}. Choose color theme.`

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          title={label}
          className="border-transparent focus-visible:border-transparent focus-visible:ring-0 aria-expanded:border-transparent"
        >
          <ThemeIcon theme={activeTheme} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {themeOptions.map((option) => (
            <DropdownMenuItem key={option} onSelect={() => setTheme(option)}>
              {themeLabels[option]}
              <Check className={activeTheme === option ? "ml-auto size-3" : "ml-auto size-3 opacity-0"} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
