'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import { useParams } from 'next/navigation'
import { Locale } from '@/dictionaries/i18n-config'
import { getDictionary } from '@/dictionaries/get-dictionary'
import { Spotlight } from '@/components/ui/Spotlight'
import { GridBackground } from '@/components/ui/GridBackground'
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card'
import { OrbitingCircles } from '@/components/magicui/orbiting-circles'
import { TypingAnimation } from '@/components/magicui/typing-animation'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import Image from '@/components/Image'
import {
  Trae,
  Dify,
  ClaudeCode,
  OpenClaw,
  Ollama,
  Gemini,
  DeepSeek,
  ModelScope,
  OpenAI,
  MCP,
} from '@lobehub/icons'

const MAX_DISPLAY = 5
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

type ClaudeMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  displayContent: string
}

function ClaudeCodeTerminal() {
  const brandColor = '#d4890a'
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [spinnerIndex, setSpinnerIndex] = useState(0)
  const [clock, setClock] = useState(() => new Date())
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const typingTargetRef = useRef<{ id: string; content: string } | null>(null)
  const replyTimerRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [messages, setMessages] = useState<ClaudeMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Claude Code 终端已就绪。',
      displayContent: 'Claude Code 终端已就绪。',
    },
  ])

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        window.clearTimeout(replyTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isWorking) return
    const interval = window.setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % SPINNER_FRAMES.length)
    }, 80)
    return () => window.clearInterval(interval)
  }, [isWorking])

  useEffect(() => {
    if (!typingMessageId) return
    const target = typingTargetRef.current
    if (!target || target.id !== typingMessageId) return
    let index = 0
    const interval = window.setInterval(() => {
      index += 1
      setMessages((prev) =>
        prev.map((message) =>
          message.id === typingMessageId
            ? { ...message, displayContent: target.content.slice(0, index) }
            : message
        )
      )
      if (index >= target.content.length) {
        window.clearInterval(interval)
        setTypingMessageId(null)
      }
    }, 24)
    return () => window.clearInterval(interval)
  }, [typingMessageId])

  useEffect(() => {
    if (!isOpen) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isWorking, typingMessageId, isOpen])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    const reply = trimmed === '你好' ? '你好，欢迎来到本站。' : '演示模式：请输入“你好”。'
    const userId = `${Date.now()}-user`
    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user', content: trimmed, displayContent: trimmed },
    ])
    setIsWorking(true)
    setInput('')
    if (replyTimerRef.current) {
      window.clearTimeout(replyTimerRef.current)
    }
    replyTimerRef.current = window.setTimeout(() => {
      setIsWorking(false)
      const assistantId = `${Date.now()}-assistant`
      typingTargetRef.current = { id: assistantId, content: reply }
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: reply, displayContent: '' },
      ])
      setTypingMessageId(assistantId)
    }, 640)
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="flex flex-col items-end gap-3">
        {isOpen && (
          <div className="w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 text-gray-100 shadow-2xl backdrop-blur sm:w-[380px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ClaudeCode.Color className="h-5 w-5" />
                  Claude Code 终端
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
                aria-label="关闭终端"
              >
                关闭
              </button>
            </div>
            <div className="flex h-64 flex-col gap-4 overflow-y-auto px-4 py-4 text-sm">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-2">
                  {message.role === 'user' ? (
                    <div className="flex items-center gap-2 font-mono text-xs text-gray-100">
                      <span style={{ color: brandColor }}>❯</span>
                      <span>{message.displayContent}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold" style={{ color: brandColor }}>
                        ◆ Claude
                      </div>
                      <div
                        className="border-l-2 pl-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-100"
                        style={{ borderColor: brandColor }}
                      >
                        {message.displayContent}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isWorking && (
                <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
                  <span style={{ color: brandColor }}>{SPINNER_FRAMES[spinnerIndex]}</span>
                  <span>Working…</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="border-t border-white/10 px-3 py-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                <span className="text-xs" style={{ color: brandColor }}>
                  ❯
                </span>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="输入“你好”进行演示"
                  className="w-full bg-transparent text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none"
                  style={{ caretColor: brandColor }}
                />
                <button
                  type="submit"
                  className="rounded-md bg-white/10 px-3 py-1 text-xs text-gray-200 hover:bg-white/20"
                >
                  发送
                </button>
              </div>
            </form>
            <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-[10px] text-gray-400">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
                <span>claude-terminal.tsx v0.1</span>
                <span className="text-gray-500">↑↓ history</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">esc to cancel</span>
                <span className="text-gray-200">
                  {clock.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group hover:border-primary-400/60 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-gray-900/90 shadow-xl transition hover:scale-105"
          aria-label="打开 Claude Code 终端"
        >
          <ClaudeCode.Color className="h-7 w-7 transition group-hover:scale-110" />
        </button>
      </div>
    </div>
  )
}

export default function Home({ posts, dict, locale }) {
  if (!dict) return null

  return (
    <>
      <div className="relative min-h-[700px] overflow-hidden border-b border-gray-200 pt-8 pb-24 dark:border-gray-700">
        <GridBackground className="min-h-[700px]">
          <div className="absolute inset-0 z-0 flex translate-y-72 items-center justify-center opacity-40">
            <TextHoverEffect text="AI FOR EVERYTHING" />
          </div>
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <OrbitingCircles iconSize={35} maxIconSize={70} radius={220} speed={0.4} randomSpeed>
              <Trae.Color />
              <Dify.Color />
              <ClaudeCode.Color />
              <OpenClaw.Color />
            </OrbitingCircles>
            <OrbitingCircles
              iconSize={35}
              maxIconSize={70}
              radius={340}
              reverse
              speed={0.8}
              randomSpeed
            >
              <Ollama />
              <Gemini.Color />
              <DeepSeek.Color />
              <ModelScope.Color />
              <OpenAI />
              <MCP />
            </OrbitingCircles>
          </div>
          <CardContainer className="inter-var z-10" containerClassName="py-4">
            <CardBody className="group/card relative h-auto w-auto rounded-xl bg-transparent p-4 dark:bg-transparent">
              <CardItem translateZ="80" className="mb-4 flex w-full justify-center">
                <Image
                  src="/static/images/avatar.png"
                  alt="avatar"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white/50 shadow-2xl backdrop-blur-sm transition-transform duration-500 group-hover/card:scale-110 dark:border-gray-800/50"
                />
              </CardItem>
              <CardItem translateZ="50" className="w-full text-center">
                <h1 className="bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-2xl font-extrabold tracking-tighter text-transparent sm:text-4xl md:text-5xl dark:from-gray-100 dark:to-gray-400">
                  {dict.site.title.split(locale === 'zh-CN' ? '王华江' : 'Hua Jiang')[0]}
                  <TypingAnimation words={dict.site.typingWords} />
                </h1>
              </CardItem>
              <CardItem
                as="p"
                translateZ="60"
                className="mx-auto mt-3 max-w-lg text-center text-base leading-relaxed text-balance text-gray-600 sm:text-lg dark:text-gray-400"
              >
                {dict.site.description}
              </CardItem>
              <CardItem translateZ="100" className="mt-4 flex w-full justify-center space-x-4 pt-2">
                <Link
                  href={`/${locale}/blog`}
                  className="bg-primary-500 hover:bg-primary-600 rounded-lg px-5 py-2.5 text-white transition-colors"
                >
                  {dict.nav.blog}
                </Link>
                <Link
                  href={`/${locale}/about`}
                  className="hover:border-primary-500 dark:hover:border-primary-400 rounded-lg border border-gray-200 px-5 py-2.5 transition-colors dark:border-gray-700"
                >
                  {dict.nav.about}
                </Link>
              </CardItem>
            </CardBody>
          </CardContainer>
        </GridBackground>
      </div>
      <div className="space-y-4">
        <div className="pt-12 pb-8 text-center md:space-y-5">
          <h2 className="text-2xl leading-9 font-bold tracking-tight text-gray-900 sm:text-3xl sm:leading-10 md:text-4xl dark:text-gray-100">
            {dict.blog.all_posts}
          </h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-1 md:gap-6">
          {!posts.length && dict.blog.no_posts}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <article
                key={slug}
                className="group relative flex flex-col space-y-2 rounded-2xl p-6 transition-all hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              >
                <div className="flex flex-col space-y-3">
                  <dl>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-sm leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, locale)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-3">
                    <h2 className="text-2xl leading-8 font-bold tracking-tight">
                      <Link
                        href={`/${locale}/blog/${slug}`}
                        className="text-gray-900 dark:text-gray-100"
                      >
                        {title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} locale={locale} />
                      ))}
                    </div>
                    <div className="prose max-w-none text-gray-600 dark:text-gray-400">
                      {summary}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-center text-base leading-6 font-medium">
          <Link
            href={`/${locale}/blog`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={dict.blog.all_posts}
          >
            {dict.blog.all_posts} &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
      <ClaudeCodeTerminal />
    </>
  )
}
