import { cn } from '@/lib/utils'
import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export interface OrbitingCirclesProps {
  className?: string
  children?: React.ReactNode
  reverse?: boolean
  duration?: number
  delay?: number
  radius?: number
  path?: boolean
  iconSize?: number
  maxIconSize?: number
  speed?: number
  randomSpeed?: boolean
}

export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  delay = 0,
  radius = 50,
  path = true,
  iconSize = 30,
  maxIconSize,
  speed = 1,
  randomSpeed = false,
}: OrbitingCirclesProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 统一计算随机尺寸和速度因子，确保它们同步
  const orbitData = useMemo(() => {
    if (!mounted) return null

    return React.Children.map(children, () => {
      // 1. 计算随机尺寸
      let size = iconSize
      if (maxIconSize) {
        size = Math.floor(Math.random() * (maxIconSize - iconSize + 1)) + iconSize
      }

      // 2. 计算速度因子 (基于尺寸：越大的越慢，越小的越快)
      let factor = 1
      if (randomSpeed) {
        if (maxIconSize && maxIconSize > iconSize) {
          // 归一化尺寸 (0 = 最小, 1 = 最大)
          const normalized = (size - iconSize) / (maxIconSize - iconSize)
          // 映射到速度因子 (最小尺寸速度因子为 1.4，最大尺寸速度因子为 0.6)
          factor = 1.4 - normalized * 0.8
        } else {
          // 如果没有 maxIconSize，则完全随机
          factor = 0.8 + Math.random() * 0.4
        }
      }

      return { size, factor }
    })
  }, [mounted, children, iconSize, maxIconSize, randomSpeed])

  const calculatedDuration = duration / speed

  if (!mounted || !orbitData) return null

  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <circle
            className="stroke-black/10 stroke-1 dark:stroke-white/10"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}

      <div
        className={cn(
          'absolute flex size-full items-center justify-center rounded-full border-none bg-transparent',
          className
        )}
      >
        {React.Children.map(children, (child, index) => {
          const angle = (360 / React.Children.count(children)) * index
          const { size: currentIconSize, factor: randomFactor } = orbitData[index]
          const individualDuration = calculatedDuration / randomFactor

          return (
            <motion.div
              key={index}
              style={
                {
                  '--icon-size': `${currentIconSize}px`,
                  position: 'absolute',
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                } as React.CSSProperties
              }
              animate={{
                rotate: reverse ? [angle, angle - 360] : [angle, angle + 360],
              }}
              transition={{
                duration: individualDuration,
                repeat: Infinity,
                ease: 'linear',
                delay: -delay,
              }}
            >
              <motion.div
                style={{
                  width: 'var(--icon-size)',
                  height: 'var(--icon-size)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                initial={{ y: radius }}
                animate={{
                  rotate: reverse ? [-angle, -angle + 360] : [-angle, -angle - 360],
                }}
                transition={{
                  duration: individualDuration,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: -delay,
                }}
              >
                {React.isValidElement(child)
                  ? React.cloneElement(child as React.ReactElement<{ size?: number }>, {
                      size: currentIconSize,
                    })
                  : child}
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
