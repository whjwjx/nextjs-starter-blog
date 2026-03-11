'use client'

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { ClaudeCode } from '@lobehub/icons'
import {
  DAILY_SCHEDULE,
  STATUS_QUESTIONS,
  type ScheduleItem,
} from '@/data/claude-reference/schedule'

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

type ClaudeMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  displayContent: string
}

type ReplyPlan = { type: 'clear' } | { type: 'reply'; content: string }

const toMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes()

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

const getStatusByMinutes = (minutes: number, schedule: ScheduleItem[]) =>
  schedule.find((item) => minutes >= item.start && minutes < item.end) ?? schedule[0]

const formatSchedule = (schedule: ScheduleItem[]) =>
  schedule
    .map(
      (item) =>
        `${formatTime(item.start)}-${formatTime(item.end)}  ${item.title} - ${item.description}`
    )
    .join('\n')

const isStatusQuestion = (input: string) =>
  STATUS_QUESTIONS.some((question) => input.includes(question))

export function ClaudeCodeTerminal() {
  const brandColor = '#d4890a'
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [spinnerIndex, setSpinnerIndex] = useState(0)
  const [clock, setClock] = useState(() => new Date())
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const typingTargetRef = useRef<{ id: string; content: string } | null>(null)
  const replyTimerRef = useRef<number | null>(null)
  const bubbleTimerRef = useRef<number | null>(null)
  const bubbleLoopRef = useRef<number | null>(null)
  const welcomeShownRef = useRef(false)
  const lastBubbleAtRef = useRef(0)
  const idleTimerRef = useRef<number | null>(null)
  const isIdleRef = useRef(true)
  const isVisibleRef = useRef(true)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputDraftRef = useRef('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [messages, setMessages] = useState<ClaudeMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        '╭─── Claude Code ──────────────────────────────────────────────╮\n' +
        '│ Tips for getting started                                     │\n' +
        '│ Welcome back!  输入 help 查看可用指令                          │\n' +
        '│ ──────────────────────────────────────────────────────────── │\n' +
        '│ Recent activity: No recent activity                          │\n' +
        '╰──────────────────────────────────────────────────────────────╯',
      displayContent:
        '╭─── Claude Code ──────────────────────────────────────────────╮\n' +
        '│ Tips for getting started                                     │\n' +
        '│ Welcome back!  输入 help 查看可用指令                          │\n' +
        '│ ──────────────────────────────────────────────────────────── │\n' +
        '│ Recent activity: No recent activity                          │\n' +
        '╰──────────────────────────────────────────────────────────────╯',
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
      if (bubbleTimerRef.current) {
        window.clearTimeout(bubbleTimerRef.current)
      }
      if (bubbleLoopRef.current) {
        window.clearTimeout(bubbleLoopRef.current)
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
    const lines = target.content.split('\n')
    let index = 0
    const interval = window.setInterval(() => {
      index += 1
      setMessages((prev) =>
        prev.map((message) =>
          message.id === typingMessageId
            ? { ...message, displayContent: lines.slice(0, index).join('\n') }
            : message
        )
      )
      if (index >= lines.length) {
        window.clearInterval(interval)
        setTypingMessageId(null)
      }
    }, 120)
    return () => window.clearInterval(interval)
  }, [typingMessageId])

  useEffect(() => {
    if (!isOpen) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isWorking, typingMessageId, isOpen])

  useEffect(() => {
    const showBubble = (text: string) => {
      setBubbleText(text)
      lastBubbleAtRef.current = Date.now()
      if (bubbleTimerRef.current) {
        window.clearTimeout(bubbleTimerRef.current)
      }
      bubbleTimerRef.current = window.setTimeout(() => {
        setBubbleText(null)
      }, 3600)
    }

    const setIdleAfterDelay = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current)
      }
      idleTimerRef.current = window.setTimeout(() => {
        isIdleRef.current = true
      }, 5000)
    }

    const handleMouseMove = () => {
      isIdleRef.current = false
      setIdleAfterDelay()
    }

    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible'
    }

    const handleBlur = () => {
      isVisibleRef.current = false
    }

    const handleFocus = () => {
      isVisibleRef.current = true
    }

    isVisibleRef.current = document.visibilityState === 'visible'
    setIdleAfterDelay()
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    if (!welcomeShownRef.current) {
      showBubble('欢迎来到本站，点我打开终端')
      welcomeShownRef.current = true
    }

    const messages = ['需要帮忙吗？', '输入 help 查看指令', '点我打开终端']

    const canShowBubble = () => {
      const now = Date.now()
      const isActive = isVisibleRef.current && !isIdleRef.current
      const minInterval = isActive ? 12000 : 5000
      if (now - lastBubbleAtRef.current < minInterval) return false
      return true
    }

    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 15000
      bubbleLoopRef.current = window.setTimeout(() => {
        if (!isOpen && canShowBubble()) {
          const next = messages[Math.floor(Math.random() * messages.length)]
          showBubble(next)
        }
        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => {
      if (bubbleLoopRef.current) {
        window.clearTimeout(bubbleLoopRef.current)
      }
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isOpen])

  const schedule = DAILY_SCHEDULE
  const currentMinutes = toMinutes(clock)
  const currentStatus = getStatusByMinutes(currentMinutes, schedule)
  const currentTimeText = formatTime(currentMinutes)

  const buildStatusReply = (date: Date) => {
    const minutes = toMinutes(date)
    const status = getStatusByMinutes(minutes, schedule)
    return `状态：${status.title}\n描述：${status.description}\n时间：${formatTime(minutes)}`
  }

  const buildHelpReply = () =>
    [
      '可用指令：',
      'status / now  查看当前作息状态',
      'schedule      查看完整作息表',
      'whoami        查看当前身份',
      'help          查看帮助',
      'clear         清空终端内容',
      '',
      '也可输入：目前网站主人在干嘛？他在忙什么？现在干什么？',
    ].join('\n')

  const buildReplyPlan = (text: string): ReplyPlan => {
    const normalized = text.toLowerCase()
    if (normalized === 'clear') {
      return { type: 'clear' }
    }
    if (normalized === 'help') {
      return { type: 'reply', content: buildHelpReply() }
    }
    if (normalized === 'whoami') {
      return { type: 'reply', content: '你正在使用 Claude Code 终端演示环境。' }
    }
    if (normalized === 'schedule') {
      return { type: 'reply', content: formatSchedule(schedule) }
    }
    if (normalized === 'status' || normalized === 'now' || isStatusQuestion(text)) {
      return { type: 'reply', content: buildStatusReply(new Date()) }
    }
    if (text === '你好') {
      return { type: 'reply', content: '你好，欢迎来到本站。' }
    }
    return { type: 'reply', content: `未识别指令：${text}\n输入 help 查看可用指令。` }
  }

  const updateHistory = (value: string) => {
    setHistory((prev) => [...prev, value])
    setHistoryIndex(null)
    inputDraftRef.current = ''
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInput(value)
    if (historyIndex === null) {
      inputDraftRef.current = value
    }
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (history.length === 0) return
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(historyIndex - 1, 0)
      setHistoryIndex(nextIndex)
      setInput(history[nextIndex])
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (historyIndex === null) return
      if (historyIndex >= history.length - 1) {
        setHistoryIndex(null)
        setInput(inputDraftRef.current)
        return
      }
      const nextIndex = historyIndex + 1
      setHistoryIndex(nextIndex)
      setInput(history[nextIndex])
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleRestore = () => {
    setIsMinimized(false)
  }

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev)
    setIsMinimized(false)
    setBubbleText(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    const replyPlan = buildReplyPlan(trimmed)
    updateHistory(trimmed)
    if (replyPlan.type === 'clear') {
      if (replyTimerRef.current) {
        window.clearTimeout(replyTimerRef.current)
      }
      setIsWorking(false)
      setTypingMessageId(null)
      setMessages([])
      setInput('')
      return
    }
    const reply = replyPlan.content
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
          <div className="w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 text-gray-100 shadow-2xl backdrop-blur sm:w-[640px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-2.5 w-2.5 rounded-full bg-red-500"
                    aria-label="关闭终端"
                  />
                  <button
                    type="button"
                    onClick={handleMinimize}
                    className="h-2.5 w-2.5 rounded-full bg-yellow-400"
                    aria-label="最小化终端"
                  />
                  <button
                    type="button"
                    onClick={handleRestore}
                    className="h-2.5 w-2.5 rounded-full bg-green-500"
                    aria-label="复原终端"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">终端</div>
              </div>
              <div className="text-xs text-gray-400">
                Now · {currentStatus.title} · {currentTimeText}
              </div>
            </div>
            {!isMinimized && (
              <>
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
                            className="max-w-full overflow-x-auto border-l-2 pl-3 font-mono text-xs leading-relaxed whitespace-pre text-gray-100"
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
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      placeholder="输入指令或问题"
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
              </>
            )}
          </div>
        )}
        <div className="relative">
          {bubbleText && (
            <div className="pointer-events-none absolute top-1/2 right-full mr-3 max-w-[320px] -translate-y-1/2 rounded-lg border border-white/10 bg-gray-900/95 px-4 py-3 text-sm text-gray-100 shadow-xl backdrop-blur">
              <span className="block leading-relaxed whitespace-nowrap">{bubbleText}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleToggleOpen}
            className="group hover:border-primary-400/60 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-gray-900/90 shadow-xl transition hover:scale-105"
            aria-label="打开 Claude Code 终端"
          >
            <ClaudeCode.Color className="h-7 w-7 transition group-hover:scale-110" />
          </button>
        </div>
      </div>
    </div>
  )
}
