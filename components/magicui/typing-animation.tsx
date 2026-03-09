'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TypingAnimationProps {
  words: string[]
  className?: string
  delay?: number
  pauseDelay?: number
  speed?: number
  deleteSpeed?: number
  loop?: boolean
  blinkCursor?: boolean
}

export function TypingAnimation({
  words,
  className,
  pauseDelay = 2000,
  speed = 100,
  deleteSpeed = 50,
  loop = true,
  blinkCursor = true,
}: TypingAnimationProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = words[currentWordIndex]

    const handleTyping = () => {
      if (!isDeleting) {
        if (currentText.length < word.length) {
          setCurrentText(word.slice(0, currentText.length + 1))
        } else {
          if (loop || currentWordIndex < words.length - 1) {
            setTimeout(() => setIsDeleting(true), pauseDelay)
          }
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(word.slice(0, currentText.length - 1))
        } else {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }

    const timeout = setTimeout(handleTyping, isDeleting ? deleteSpeed : speed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex, words, pauseDelay, speed, deleteSpeed, loop])

  return (
    <span className={cn('inline-block', className)}>
      {currentText}
      {blinkCursor && (
        <span className="animate-cursor-blink ml-1 inline-block h-[0.9em] w-[2px] bg-gray-900 align-middle dark:bg-gray-100" />
      )}
    </span>
  )
}
