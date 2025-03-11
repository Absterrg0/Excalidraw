"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { useState, useEffect } from "react"

export function AuthForm() {
  const handleGoogleSignIn = () => signIn("google", { callbackUrl: "/canvas" })

  // Define the keyframes animation directly in the component
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Add the keyframes animation directly to the document
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes buttonShine {
        from { left: -100%; }
        to { left: 100%; }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Google Sign-in Button */}
      <Button
        variant="outline"
        className="w-full flex items-center justify-center h-14 rounded-xl border transition-all duration-300 group relative overflow-hidden"
        onClick={handleGoogleSignIn}
        style={{
          backgroundColor: "rgba(39, 39, 42, 0.4)",
          borderColor: "rgba(63, 63, 70, 0.5)",
          color: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(39, 39, 42, 0.6)"
          e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.5)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(39, 39, 42, 0.4)"
          e.currentTarget.style.borderColor = "rgba(63, 63, 70, 0.5)"
        }}
      >
        {/* Subtle gradient overlay that appears on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to right, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
          }}
        />

        {/* Button shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div
            className="absolute h-full w-1/2 z-5 block transform -skew-x-12"
            style={{
              background: "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1))",
              top: 0,
              bottom: 0,
              left: "-100%",
              animation: "buttonShine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />
        </div>

        {/* Google icon with enhanced styling */}
        <div
          className="mr-3 rounded-full shadow-md transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundColor: "rgba(255, 255, 255, 1)",
            padding: "6px",
          }}
        >
          <FcGoogle className="h-5 w-5" />
        </div>

        {/* Text with subtle animation */}
        <span
          className="transition-all duration-300"
          style={{
            fontWeight: 500,
            letterSpacing: "0.025em",
            color: "rgba(255, 255, 255, 0.95)",
          }}
        >
          Continue with Google
        </span>
      </Button>

      {/* Optional: Subtle informational text */}
      <p
        className="text-xs text-center mt-4 px-6"
        style={{
          color: "rgba(161, 161, 170, 0.9)",
        }}
      >
        Securely sign in with your Google account. We don't store your password.
      </p>
    </div>
  )
}

