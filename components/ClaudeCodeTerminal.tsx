'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ClaudeCode } from '@lobehub/icons'

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

type ClaudeMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  displayContent: string
}

export function ClaudeCodeTerminal() {
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
