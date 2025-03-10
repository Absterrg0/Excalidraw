"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"

interface AuthButtonProps {
  variant: "google" | "github"
  onClick: () => void
}

const AuthButton = ({ onClick, variant }: AuthButtonProps) => {
  const isGoogle = variant === "google"

  return (
    <div className="w-full">
      <Button
        variant="outline"
        className={`w-full relative flex items-center justify-center h-14 px-6 rounded-lg border ${
          isGoogle
            ? "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
            : "bg-[#24292e] text-white border-gray-700 hover:bg-[#2f363d]"
        }`}
        onClick={onClick}
      >
        {isGoogle ? <FcGoogle className="h-5 w-5 mr-3" /> : <FaGithub className="h-5 w-5 mr-3" />}
        <span className="font-semibold text-base">Continue with {isGoogle ? "Google" : "GitHub"}</span>
      </Button>
    </div>
  )
}

export function AuthForm() {
  const handleGoogleSignIn = () => signIn("google", { callbackUrl: "/dashboard" })

  return (
    <div className="space-y-4 w-full max-w-sm mx-auto">
      <AuthButton variant="google" onClick={handleGoogleSignIn} />
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        By signing in, you agree to our{" "}
        <a
          href="#"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  )
}

