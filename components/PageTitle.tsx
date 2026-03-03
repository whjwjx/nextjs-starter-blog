import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PageTitle({ children }: Props) {
  return (
    <h1 className="from-primary-600 to-primary-400 dark:from-primary-400 dark:to-primary-200 bg-linear-to-r bg-clip-text text-3xl leading-9 font-extrabold tracking-tight text-transparent sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
      {children}
    </h1>
  )
}
