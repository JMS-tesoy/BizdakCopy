import type { Follower } from "./types"
import { normalizeEmail } from "@/lib/validations/email"

// Demo followers store - replace with database in production
const followers: Map<string, Follower> = new Map()

// Add a demo follower for testing
const demoFollower: Follower = {
  id: "follower_demo",
  email: "demo@example.com",
  apiKey: "demo_api_key_12345",
  subscriptionTier: "pro",
  subscriptionStatus: "active",
  maxAccounts: 5,
  connectedAccounts: 1,
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
}
followers.set(demoFollower.apiKey, demoFollower)

export function validateApiKey(apiKey: string): Follower | null {
  const follower = followers.get(apiKey)
  if (!follower) return null
  if (follower.subscriptionStatus !== "active") return null

  // Update last active
  follower.lastActive = new Date().toISOString()
  return follower
}

export function createFollower(email: string, tier: "starter" | "pro" | "enterprise"): Follower {
  const maxAccounts = tier === "starter" ? 2 : tier === "pro" ? 5 : 999
  const apiKey = `fbc_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  const normalizedEmail = normalizeEmail(email)

  const follower: Follower = {
    id: `follower_${Date.now()}`,
    email: normalizedEmail,
    apiKey,
    subscriptionTier: tier,
    subscriptionStatus: "active",
    maxAccounts,
    connectedAccounts: 0,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  }

  followers.set(apiKey, follower)
  return follower
}

export function getFollowerByEmail(email: string): Follower | null {
  const normalizedEmail = normalizeEmail(email)

  for (const follower of followers.values()) {
    if (normalizeEmail(follower.email) === normalizedEmail) return follower
  }
  return null
}

export function updateFollowerSubscription(apiKey: string, status: "active" | "inactive" | "expired"): boolean {
  const follower = followers.get(apiKey)
  if (!follower) return false
  follower.subscriptionStatus = status
  return true
}
