"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AuthForm } from "./Auth-form"

// Define types for our components
interface Particle {
  id: number
  top: string
  left: string
  duration: string
  delay: string
}

interface FloatingElement {
  id: number
  top: string
  left: string
  duration: string
  delay: string
}

// Stateful particle component to avoid hydration errors
const ParticleSystem: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate particles only on client-side
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }))

    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
          style={{
            top: particle.top,
            left: particle.left,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  )
}

// Stateful floating elements
const FloatingElements: React.FC = () => {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    // Generate elements only on client-side
    const newElements: FloatingElement[] = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      top: `${20 + i * 30}%`,
      left: `${10 + i * 40}%`,
      duration: `${8 + i}s`,
      delay: `${i * 1}s`,
    }))

    setElements(newElements)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute w-24 h-24"
          style={{
            top: element.top,
            left: element.left,
            animation: `float ${element.duration} infinite ease-in-out`,
            animationDelay: element.delay,
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-xl transform rotate-45" />
        </div>
      ))}
    </div>
  )
}

const BrandLogo: React.FC = () => (
  <div className="flex items-center justify-center mb-8">
    <div className="relative h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
      <div className="absolute inset-1 bg-zinc-950 rounded-lg flex items-center justify-center">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-2xl font-bold">
          JD
        </span>
      </div>
    </div>
  </div>
)

// Define props type for the main component if needed
type AuthPageProps = {}

const AuthPage: React.FC<AuthPageProps> = () => {
  // Empty div for initial server render to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState<boolean>(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex bg-zinc-900 relative overflow-hidden">
      {/* Static Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Animated elements - only render on client */}
      {isMounted && (
        <>
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 opacity-80" />
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20" />
          <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20" />

          {/* Glow effects */}
          <div className="absolute top-40 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 -right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />

          {/* Client-side only components */}
          <FloatingElements />
          <ParticleSystem />
        </>
      )}

      {/* Auth Container */}
      <div className="w-full flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Card Effect - Reduced opacity from 70% to 40% */}
          <div className="bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-zinc-800/60 p-8 shadow-2xl relative overflow-hidden group transition-all duration-300 hover:bg-zinc-950/45 hover:border-zinc-700/60">
            {/* Subtle inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Subtle top highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

            <BrandLogo />

            <h2 className="text-3xl font-bold tracking-tight mb-3 text-center text-white drop-shadow-sm">
              Welcome to JustDraw
            </h2>

            <p className="text-zinc-300 text-sm mb-8 text-center max-w-xs mx-auto">
              Sign in to obtain the best canvas to express themselves
            </p>

            {/* Horizontal line with gradient */}
            <div className="relative h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-8" />

            {/* Auth Form */}
            <div className="space-y-6">
              <AuthForm />
            </div>
          </div>

          {/* Footer text */}
          <p className="text-zinc-500 text-xs text-center mt-6 max-w-xs mx-auto">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage

