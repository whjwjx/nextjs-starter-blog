import React from 'react'

interface SkillIconsProps {
  icons: string[]
  theme?: 'light' | 'dark'
  perline?: number
  className?: string
}

/**
 * SkillIcons component that renders skill icons from skillicons.dev
 * @param icons - Array of icon IDs (e.g. ['js', 'ts', 'react'])
 * @param theme - Theme for the icons ('light' or 'dark', default 'dark')
 * @param perline - Number of icons per line (default 15)
 * @param className - Additional CSS classes
 */
export const SkillIcons: React.FC<SkillIconsProps> = ({
  icons,
  theme = 'dark',
  perline = 15,
  className = '',
}) => {
  if (!icons || icons.length === 0) return null

  const iconsStr = icons.join(',')
  const url = `https://skillicons.dev/icons?i=${iconsStr}&theme=${theme}&perline=${perline}`

  return (
    <div className={`my-6 flex justify-center py-4 px-4 rounded-xl bg-gray-50/30 dark:bg-gray-800/20 border border-gray-100/50 dark:border-gray-700/30 ${className}`}>
      <a
        href="https://skillicons.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
      >
        <img src={url} alt="My Skills" className="max-w-full drop-shadow-sm" />
      </a>
    </div>
  )
}
