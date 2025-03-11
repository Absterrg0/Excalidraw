"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import type { PossibleShapes } from "../Canvas"
import { AnimatePresence, type MotionValue, motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { useRef, useState } from "react"

export const FloatingDock = ({
  items,
  selectedShape,
  setSelectedShape,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: PossibleShapes; icon: React.ReactNode }[]
  selectedShape: PossibleShapes
  setSelectedShape: (shape: PossibleShapes) => void
  desktopClassName?: string
  mobileClassName?: string
}) => {
  return (
    <>
      <FloatingDockDesktop
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        items={items}
        className={desktopClassName}
      />
      <FloatingDockMobile
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        items={items}
        className={mobileClassName}
      />
    </>
  )
}

const FloatingDockMobile = ({
  items,
  selectedShape,
  setSelectedShape,
  className,
}: {
  items: { title: PossibleShapes; icon: React.ReactNode }[]
  selectedShape: PossibleShapes
  setSelectedShape: (shape: PossibleShapes) => void
  className?: string
}) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div layoutId="nav" className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2 items-center">
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <button
                  onClick={() => {
                    setSelectedShape(item.title)
                    setOpen(false)
                  }}
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    selectedShape === item.title
                      ? "bg-primary/20 text-primary"
                      : "bg-gray-50 dark:bg-neutral-900 text-foreground",
                  )}
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shadow-md"
      >
        <Menu className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  )
}

const FloatingDockDesktop = ({
  items,
  selectedShape,
  setSelectedShape,
  className,
}: {
  items: { title: PossibleShapes; icon: React.ReactNode }[]
  selectedShape: PossibleShapes
  setSelectedShape: (shape: PossibleShapes) => void
  className?: string
}) => {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY)
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
      className={cn(
        "mx-auto hidden md:flex h-16 gap-4 items-end rounded-2xl bg-gray-50 dark:bg-neutral-900 px-4 pb-3",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer
          selectedShape={selectedShape}
          setSelectedShape={setSelectedShape}
          mouseX={mouseX}
          key={item.title}
          {...item}
        />
      ))}
    </motion.div>
  )
}

function IconContainer({
  mouseX,
  title,
  icon,
  selectedShape,
  setSelectedShape,
}: {
  mouseX: MotionValue
  title: PossibleShapes
  selectedShape: PossibleShapes
  setSelectedShape: (shape: PossibleShapes) => void
  icon: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40])
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40])

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20])
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20])

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "aspect-square rounded-full flex items-center justify-center relative cursor-pointer",
        selectedShape === title ? "bg-primary/20" : "bg-gray-200 dark:bg-neutral-800",
      )}
      onClick={() => setSelectedShape(title)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="px-2 py-0.5 whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className={cn("flex items-center justify-center", selectedShape === title ? "text-primary" : "text-foreground")}
      >
        {icon}
      </motion.div>
    </motion.div>
  )
}

