'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TypingAnimationProps {
  children: string
  className?: string
  duration?: number
  delay?: number
  as?: React.ElementType
  startOnView?: boolean
  cursor?: string
}

export default function TypingAnimation({
  children,
  className,
  duration = 100,
  delay = 0,
  as: Component = 'div',
  startOnView = false,
  cursor = '_',
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>('')

  useEffect(() => {
    let i = 0
    let typingEffect: ReturnType<typeof setInterval> | null = null
    const timeoutId = setTimeout(() => {
      typingEffect = setInterval(() => {
        if (i < children.length) {
          setDisplayedText(children.substring(0, i + 1))
          i++
        } else {
          if (typingEffect) clearInterval(typingEffect)
        }
      }, duration)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      if (typingEffect) clearInterval(typingEffect)
    }
  }, [children, duration, delay])

  return (
    <Component
      className={cn(
        'font-display font-bold tracking-tight',
        className
      )}
    >
      {displayedText}
      <span className="ml-0.5 inline-block animate-pulse font-normal">{cursor}</span>
    </Component>
  )
}
