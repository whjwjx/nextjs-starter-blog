'use client'

import {
  useEffect,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { useParams } from 'next/navigation'
import { ClaudeCode } from '@lobehub/icons'
import {
  DAILY_SCHEDULE,
  STATUS_QUESTIONS,
  type ScheduleItem,
} from '@/data/claude-reference/schedule'
import siteMetadata from '@/data/siteMetadata'

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

const getNextStatusByMinutes = (minutes: number, schedule: ScheduleItem[]) => {
  const currentIndex = schedule.findIndex((item) => minutes >= item.start && minutes < item.end)
  if (currentIndex === -1) return schedule[0]
  return schedule[(currentIndex + 1) % schedule.length]
}

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
  const params = useParams()
  const locale = (params?.locale as string) ?? 'zh-CN'
  const isEnglish = locale.startsWith('en')
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
  const [contentHeight, setContentHeight] = useState(400)
  const [panelWidth, setPanelWidth] = useState(580)
  const resizingRef = useRef(false)
  const resizingWidthRef = useRef(false)
  const startYRef = useRef(0)
  const startHeightRef = useRef(0)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
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
  const schedule = DAILY_SCHEDULE

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
      showBubble(isEnglish ? 'Hi, tap me to chat' : '嗨，欢迎来访，点我聊聊')
      welcomeShownRef.current = true
    }

    const buildStatusBubble = () => {
      const minutes = toMinutes(new Date())
      const current = getStatusByMinutes(minutes, schedule)
      const next = getNextStatusByMinutes(minutes, schedule)
      return isEnglish
        ? `Owner now: ${current.title}, next: ${next.title}`
        : `站长现在：${current.title}，接下来：${next.title}`
    }

    const messages = isEnglish
      ? [
          () => 'Need help? I am here.',
          buildStatusBubble,
          () => `Email the owner: ${siteMetadata.email}`,
          () => 'Ask me any question, I will try to help.',
          () => 'Tap to open the terminal',
        ]
      : [
          () => '有问题可以和我聊聊，我在这里。',
          buildStatusBubble,
          () => `有事邮件联系：${siteMetadata.email}`,
          () => '想看作息？输入 status 或 schedule。',
          () => '点我打开终端，我们开始吧。',
        ]

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
          showBubble(next())
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
  }, [isOpen, isEnglish, schedule])

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

  const handleResizing = useCallback((e: MouseEvent) => {
    if (!resizingRef.current) return
    const delta = startYRef.current - e.clientY
    const min = 160
    const max = Math.max(200, Math.min(window.innerHeight - 200, 720))
    let next = startHeightRef.current + delta
    if (next < min) next = min
    if (next > max) next = max
    setContentHeight(next)
  }, [])

  const handleResizeEnd = useCallback(() => {
    resizingRef.current = false
    window.removeEventListener('mousemove', handleResizing)
    window.removeEventListener('mouseup', handleResizeEnd)
  }, [handleResizing])

  const handleResizeStart = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    resizingRef.current = true
    startYRef.current = e.clientY
    startHeightRef.current = contentHeight
    window.addEventListener('mousemove', handleResizing)
    window.addEventListener('mouseup', handleResizeEnd)
  }

  const handleWidthResizing = useCallback((e: MouseEvent) => {
    if (!resizingWidthRef.current) return
    const delta = startXRef.current - e.clientX
    const min = 320
    const max = Math.max(360, Math.min(window.innerWidth - 64, 900))
    let next = startWidthRef.current + delta
    if (next < min) next = min
    if (next > max) next = max
    setPanelWidth(next)
  }, [])

  const handleWidthResizeEnd = useCallback(() => {
    resizingWidthRef.current = false
    window.removeEventListener('mousemove', handleWidthResizing)
    window.removeEventListener('mouseup', handleWidthResizeEnd)
  }, [handleWidthResizing])

  const handleWidthResizeStart = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    resizingWidthRef.current = true
    startXRef.current = e.clientX
    startWidthRef.current = panelWidth
    window.addEventListener('mousemove', handleWidthResizing)
    window.addEventListener('mouseup', handleWidthResizeEnd)
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleResizing)
      window.removeEventListener('mouseup', handleResizeEnd)
      window.removeEventListener('mousemove', handleWidthResizing)
      window.removeEventListener('mouseup', handleWidthResizeEnd)
    }
  }, [handleResizing, handleResizeEnd, handleWidthResizing, handleWidthResizeEnd])

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      <div className="flex flex-col items-end gap-3">
        {isOpen && (
          <div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 text-gray-100 shadow-2xl backdrop-blur sm:relative sm:bottom-auto sm:left-auto sm:translate-x-0"
            style={{ width: `min(${panelWidth}px, calc(100vw - 32px))` }}
          >
            <button
              type="button"
              aria-label="调整终端高度"
              onMouseDown={handleResizeStart}
              className="absolute top-0 right-0 left-0 z-10 h-2"
              style={{ cursor: 'ns-resize' }}
            />
            <button
              type="button"
              aria-label="调整终端宽度"
              onMouseDown={handleWidthResizeStart}
              className="absolute top-0 bottom-0 left-0 z-10 w-2"
              style={{ cursor: 'ew-resize' }}
            />
            <div className="flex items-center justify-between border-b border-white/10 px-2.5 py-1.5 sm:px-4 sm:py-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-2 w-2 rounded-full bg-red-500 sm:h-2.5 sm:w-2.5"
                    aria-label="关闭终端"
                  />
                  <button
                    type="button"
                    onClick={handleMinimize}
                    className="h-2 w-2 rounded-full bg-yellow-400 sm:h-2.5 sm:w-2.5"
                    aria-label="最小化终端"
                  />
                  <button
                    type="button"
                    onClick={handleRestore}
                    className="h-2 w-2 rounded-full bg-green-500 sm:h-2.5 sm:w-2.5"
                    aria-label="复原终端"
                  />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold sm:text-sm">
                  终端
                </div>
              </div>
              <div className="text-[9px] text-gray-400 sm:text-xs">
                Now · {currentStatus.title} · {currentTimeText}
              </div>
            </div>
            {!isMinimized && (
              <>
                <div
                  className="thin-scrollbar flex flex-col gap-2 overflow-y-auto px-2.5 py-2.5 text-[10px] sm:gap-4 sm:px-4 sm:py-4 sm:text-sm"
                  style={{ height: contentHeight }}
                >
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-1.5 sm:gap-2">
                      {message.role === 'user' ? (
                        <div className="flex items-center gap-2 font-mono text-[10px] text-gray-100 sm:text-xs">
                          <span style={{ color: brandColor }}>❯</span>
                          <span>{message.displayContent}</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 sm:space-y-2">
                          <div
                            className="text-[9px] font-semibold sm:text-[11px]"
                            style={{ color: brandColor }}
                          >
                            ◆ Claude
                          </div>
                          <div
                            className="max-w-full overflow-x-auto border-l-2 pl-2.5 font-mono text-[10px] leading-relaxed whitespace-pre text-gray-100 sm:pl-3 sm:text-xs"
                            style={{ borderColor: brandColor }}
                          >
                            {message.displayContent}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isWorking && (
                    <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400 sm:text-xs">
                      <span style={{ color: brandColor }}>{SPINNER_FRAMES[spinnerIndex]}</span>
                      <span>Working…</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="border-t border-white/10 px-2.5 py-1.5 sm:px-3 sm:py-3"
                >
                  <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 sm:rounded-xl sm:px-3 sm:py-2">
                    <span className="text-[10px] sm:text-xs" style={{ color: brandColor }}>
                      ❯
                    </span>
                    <input
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      placeholder="输入指令或问题"
                      className="w-full bg-transparent text-[10px] text-gray-100 placeholder:text-gray-500 focus:outline-none sm:text-xs"
                      style={{ caretColor: brandColor }}
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-gray-200 hover:bg-white/20 sm:px-3 sm:text-xs"
                    >
                      发送
                    </button>
                  </div>
                </form>
                <div className="flex items-center justify-between border-t border-white/10 px-2.5 py-1.5 text-[8px] text-gray-400 sm:px-3 sm:py-2 sm:text-[10px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5"
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
            <div className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-lg border border-white/10 bg-gray-900/95 px-3 py-2 text-xs text-gray-100 shadow-xl backdrop-blur sm:px-4 sm:py-3 sm:text-sm">
              <span className="block leading-relaxed whitespace-nowrap">{bubbleText}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleToggleOpen}
            className="group hover:border-primary-400/60 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gray-900/90 shadow-xl transition hover:scale-105 sm:h-14 sm:w-14"
            aria-label="打开 Claude Code 终端"
          >
            <ClaudeCode.Color className="h-6 w-6 transition group-hover:scale-110 sm:h-7 sm:w-7" />
          </button>
        </div>
      </div>
    </div>
  )
}
