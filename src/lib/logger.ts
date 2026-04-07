/**
 * Structured Logger — Edge-compatible
 *
 * Uses console methods (works on both Node.js and Edge Runtime).
 * JSON output in production, pretty console in development.
 * Automatically redacts sensitive fields in context objects.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const SENSITIVE_KEYS = /apikey|token|password|secret|authorization|key/i

function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.test(k)) {
      redacted[k] = '[REDACTED]'
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      redacted[k] = redactSensitive(v as Record<string, unknown>)
    } else {
      redacted[k] = v
    }
  }
  return redacted
}

function emit(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const isProduction = process.env.NODE_ENV === 'production'
  const safeCtx = context ? redactSensitive(context) : undefined

  if (isProduction) {
    const entry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      ...(safeCtx && { context: safeCtx }),
    }
    const line = JSON.stringify(entry)
    if (level === 'error') {
      console.error(line)
    } else {
      console.log(line)
    }
  } else {
    const prefix = { debug: '🐛', info: 'ℹ️', warn: '⚠️', error: '❌' }[level]
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    fn(`${prefix} [${level.toUpperCase()}] ${message}`, safeCtx ?? '')
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => emit('debug', msg, ctx),
  info:  (msg: string, ctx?: Record<string, unknown>) => emit('info', msg, ctx),
  warn:  (msg: string, ctx?: Record<string, unknown>) => emit('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit('error', msg, ctx),
}
