"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypingAnimationProps {
  children?: string
  words?: string[]
  className?: string
  duration?: number // Single word mode: typing speed
  delay?: number // Single word mode: initial delay
  pauseDelay?: number // Multi word mode: pause before deleting
  typeSpeed?: number // Multi word mode: typing speed
  deleteSpeed?: number // Multi word mode: deleting speed
  loop?: boolean // Multi word mode: whether to loop
  blinkCursor?: boolean // Show blinking cursor
  cursorStyle?: "line" | "block" | "underscore"
  as?: React.ElementType
}

export function TypingAnimation({
  children,
  words,
  className,
  duration = 100,
  delay = 0,
  pauseDelay = 2000,
  typeSpeed = 100,
  deleteSpeed = 50,
  loop = true,
  blinkCursor = true,
  cursorStyle = "underscore",
  as: Component = "div",
}: TypingAnimationProps) {
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  const currentWords = words || (children ? [children] : [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || currentWords.length === 0) return

    const handleTyping = () => {
      const currentWord = currentWords[wordIndex]

      if (!isDeleting) {
        // Typing
        if (text.length < currentWord.length) {
          setText(currentWord.substring(0, text.length + 1))
        } else {
          // Finished typing current word
          if (loop || wordIndex < currentWords.length - 1) {
            setTimeout(() => setIsDeleting(true), pauseDelay)
            return
          }
        }
      } else {
        // Deleting
        if (text.length > 0) {
          setText(currentWord.substring(0, text.length - 1))
        } else {
          // Finished deleting
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % currentWords.length)
          return
        }
      }
    }

    // Determine speed
    let speed = isDeleting ? deleteSpeed : typeSpeed
    
    // For single word mode without loop, use duration as speed
    if (currentWords.length === 1 && !loop && !isDeleting) {
      speed = duration
    }

    const timeout = setTimeout(handleTyping, speed)
    return () => clearTimeout(timeout)
  }, [
    text,
    isDeleting,
    wordIndex,
    currentWords,
    loop,
    pauseDelay,
    typeSpeed,
    deleteSpeed,
    duration,
    mounted,
  ])

  if (!mounted) return null

  const cursorChars = {
    line: "|",
    block: "█",
    underscore: "_",
  }

  return (
    <Component
      className={cn(
        "inline-block font-display tracking-[-0.02em]",
        className
      )}
    >
      {text}
      {blinkCursor && (
        <span className="ml-1 animate-pulse font-normal">
          {cursorChars[cursorStyle]}
        </span>
      )}
    </Component>
  )
}
