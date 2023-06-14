import { StreamLanguage, LanguageSupport } from '@codemirror/language'
import type { StreamParser } from '@codemirror/language'
import { tags as defaultTags, Tag } from '@lezer/highlight'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { colors } from '@/constants/colors'
import { SUPPORTED_COMMANDS, COMMAND_MODIFIERS, type SUPPORTED_COMMAND } from '@/utils/calendar'

const tags = {
  ...defaultTags,
  commandName: Tag.define(),
  propertyName: Tag.define(),
  propertyValue: Tag.define(),
  id: Tag.define()
}

interface ParserState {
  command: SUPPORTED_COMMAND | undefined
}

const streamParser: StreamParser<ParserState> = {
  name: 'timeTable',
  token: (stream, state) => {
    if (!stream.pos) {
      state.command = undefined
    }
    const ch = stream.string.charAt(stream.pos)
    const chPrev = stream.string.charAt(stream.pos - 1) || null
    const chNext = stream.string.charAt(stream.pos + 1) || null
    const onlySpacesBefore = !chPrev || /^\s+$/.test(stream.string.substring(0, stream.pos))

    if (ch === '/' && chNext === '/') {
      stream.skipToEnd()
      return 'comment'
    }

    if (ch === ' ') {
      stream.next()
      return null
    }

    if (ch === '@' && onlySpacesBefore) {
      const command = Object.keys(SUPPORTED_COMMANDS).find((cmd) => {
        const r = new RegExp('\\s*(' + cmd + ')(\\s|$)', 'i')
        const m = stream.string.match(r)
        if (m) {
          for (let i = 0; i <= m[0].length; i++) {
            stream.next()
          }
          return true
        }
      }) as SUPPORTED_COMMAND | undefined
      if (command) {
        state.command = command
        return 'commandName'
      }
    }

    if (ch === '$' && chNext) {
      if (stream.string.substring(stream.pos).includes(' ')) {
        stream.skipTo(' ')
      } else {
        stream.skipToEnd()
      }
      return 'id'
    }

    if (state.command) {
      if (ch === ' ') {
        stream.next()
        return 'space'
      }
      const modifier = Object.keys(COMMAND_MODIFIERS).find((mod) => {
        const r = new RegExp('^(' + mod + ')\\s', 'i')
        const m = stream.string.substring(stream.pos).match(r)
        if (m) {
          for (let i = 0; i < m[1].length; i++) {
            stream.next()
          }
          return true
        }
      })
      if (modifier) {
        return 'commandName'
      }
      const parts = stream.string.substring(stream.pos).split(/(\/\/| )/, 2)
      if (parts.length > 1) {
        for (let i = 0; i < parts[0].length; i++) {
          stream.next()
        }
      } else {
        stream.skipToEnd()
      }
      return 'propertyValue'
    }

    if (stream.string.includes(':') && !state.command) {
      const ar = stream.string.split(':', 2)
      if (stream.pos < ar[0].length) {
        stream.skipTo(':')
        stream.next()
        if (ar[1].startsWith(' ')) {
          stream.next()
        }
        return 'propertyName'
      } else {
        if (/\/\//.test(stream.string)) {
          stream.skipTo('//')
        } else {
          stream.skipToEnd()
        }
        return 'propertyValue'
      }
    }
    stream.next()
    return null
  },
  startState: () => ({
    command: undefined
  }),
  tokenTable: {
    commandName: tags.commandName,
    propertyName: tags.propertyName,
    propertyValue: tags.propertyValue,
    id: tags.id
  }
}

export const timeTableGrammar = new LanguageSupport(StreamLanguage.define(streamParser))

const highlight = HighlightStyle.define([
  { tag: tags.commandName, fontWeight: 'bold', color: colors.editor.commandName },
  { tag: tags.propertyName, color: colors.editor.propertyName },
  { tag: tags.id, color: colors.editor.id }
])

export const timeTableHighlight = syntaxHighlighting(highlight)
