'use client'
import React from 'react';
import Image from "next/image";
import { AuthForm } from './Auth-form';
const GlowingOrb = ({ className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
    <div className="absolute inset-2 bg-blue-400/20 rounded-full blur-lg" />
    <div className="absolute inset-4 bg-blue-300/20 rounded-full blur-md" />
  </div>
);

export default function AuthPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden">
      {/* Improved Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
        <Image
          src="/abstract-pattern.svg"
          alt="Abstract background pattern"
          fill
          className="opacity-20 object-cover"
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96">
          <div className="absolute w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96">
          <div className="absolute w-full h-full bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow delay-700" />
        </div>
      </div>

      {/* Auth Container */}
      <div className="w-full flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Glass Card Effect */}
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
            {/* Logo Animation */}
            <div className="mb-8 relative">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40">
                <GlowingOrb className="animate-float" />
              </div>
              
              <h2 className="text-4xl font-bold tracking-tight mb-6 pt-8 text-center">
                <span className="text-zinc-100">Welcome To</span>
                <span className="block mt-2 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 bg-clip-text text-transparent animate-gradient">
                  JustDraw
                </span>
              </h2>
              <p className="text-lg text-zinc-400 tracking-tight text-center">
                Sign in to give your users the best real time notifications.
              </p>
            </div>

            {/* Auth Form with Enhanced Styling */}
            <div className="space-y-6">
              <AuthForm />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32"
            style={{
              top: `${20 + i * 30}%`,
              left: `${10 + i * 40}%`,
              animation: `float ${8 + i}s infinite ease-in-out`,
              animationDelay: `${i * 1}s`
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-sky-500/10 to-transparent blur-xl transform rotate-45" />
          </div>
        ))}
      </div>

      {/* Enhanced Particle System */}
      <div className="absolute inset-0 z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${3 + Math.random() * 4}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}