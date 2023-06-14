export enum SUPPORTED_COMMANDS {
  CREATE_COLUMN = 'CREATE_COLUMN',
  CREATE = 'CREATE',
  UPDATE_COLUMN = 'UPDATE_COLUMN',
  UPDATE_WEEKDAYS = 'UPDATE_WEEKDAYS',
  UPDATE = 'UPDATE',
  SET_TITLE = 'SET_TITLE',
  SET_TIME_START = 'SET_TIME_START',
  SET_TIME_END = 'SET_TIME_END',
  SET_TIME_SPLIT = 'SET_TIME_SPLIT',
  SET_WEEKDAYS = 'SET_WEEKDAYS',
  SET_CELL_WIDTH = 'SET_CELL_WIDTH',
  SET_CELL_HEIGHT = 'SET_CELL_HEIGHT',
  COMMENT = 'COMMENT',
  EMPTY = 'EMPTY'
}

export enum COMMAND_MODIFIERS {
  AT = 'AT',
  IN = 'IN',
  SINCE = 'SINCE',
  WITH_SCHEDULE = 'WITH_SCHEDULE'
}

export type SUPPORTED_COMMAND = keyof typeof SUPPORTED_COMMANDS

export type COMMAND_MODIFIER = keyof typeof COMMAND_MODIFIERS

export const SET_COMMANDS = [
  SUPPORTED_COMMANDS.SET_TITLE,
  SUPPORTED_COMMANDS.SET_TIME_START,
  SUPPORTED_COMMANDS.SET_TIME_END,
  SUPPORTED_COMMANDS.SET_WEEKDAYS,
  SUPPORTED_COMMANDS.SET_CELL_WIDTH,
  SUPPORTED_COMMANDS.SET_CELL_HEIGHT
] as SUPPORTED_COMMAND[]

export const CREATE_COMMANDS = [SUPPORTED_COMMANDS.CREATE_COLUMN, SUPPORTED_COMMANDS.CREATE] as SUPPORTED_COMMAND[]

export const UPDATE_COMMANDS = [SUPPORTED_COMMANDS.UPDATE_COLUMN, SUPPORTED_COMMANDS.UPDATE_WEEKDAYS, SUPPORTED_COMMANDS.UPDATE] as SUPPORTED_COMMAND[]

export interface CommandListEntry {
  type: SUPPORTED_COMMAND
  line: number
  inlineValue?: string
  inlineEntryId?: string
  modifiers?: {
    type: COMMAND_MODIFIER
    value: string
  }[]
  rows: string[]
  options: { type: string; value: string }[]
  comments: Record<number, string>
}

export const calendarCodeToCommandList = (code: string) => {
  const out: CommandListEntry[] = []
  const rows = code.split(/\n/)
  let lastCommand: CommandListEntry | undefined = undefined
  rows.forEach((row, line) => {
    if (/^\s*$/.test(row)) {
      out.push({
        type: SUPPORTED_COMMANDS.EMPTY,
        line,
        rows: [row],
        options: [],
        comments: {}
      })
      lastCommand = undefined
    } else if (/^\s*\/\//.test(row)) {
      out.push({
        type: SUPPORTED_COMMANDS.COMMENT,
        line,
        rows: [row],
        options: [],
        comments: { 0: row.replace(/^\s*\/\/\s*/, '') }
      })
      lastCommand = undefined
    } else {
      let [trimmedRow, comment] = splitRowComment(row)
      const command = findRowCommand(trimmedRow)
      if (command) {
        lastCommand = {
          type: command,
          line,
          rows: [row],
          options: [],
          comments: comment ? { 0: comment } : {}
        }
        out.push(lastCommand)

        trimmedRow = trimmedRow.replace(new RegExp('\\s*@\\s*(' + command + ')', 'i'), '')
        const idMatch = trimmedRow.match(/(\$[^\s]+)/)
        if (idMatch) {
          lastCommand.inlineEntryId = idMatch[1]
          trimmedRow = trimmedRow.replace(/\$[^\s]+/, '')
        }

        const splitByModifiers = (' ' + trimmedRow + ' ').split(new RegExp(' (' + Object.keys(COMMAND_MODIFIERS).join('|') + ') ', 'i'))
        lastCommand.inlineValue = splitByModifiers[0].trim()
        if (splitByModifiers.length > 1) {
          lastCommand.modifiers = []
          for (let i = 1; i < splitByModifiers.length; i += 2) {
            const type = splitByModifiers[i] as COMMAND_MODIFIER
            const value = (splitByModifiers[i + 1] || '').trim()
            if (type && value) {
              lastCommand.modifiers.push({ type, value })
            }
          }
        }
      } else if (lastCommand && trimmedRow.includes(':')) {
        const [optionType] = trimmedRow.split(':', 1)
        lastCommand.options.push({
          type: optionType.trim(),
          value: trimmedRow.substring(optionType.length + 1).trim()
        })
        if (comment) {
          lastCommand.comments[line - lastCommand.line] = comment
        }
      }
    }
  })
  return out
}

const findRowCommand = (row: string) => {
  const command = Object.keys(SUPPORTED_COMMANDS).find((command) => {
    const r = new RegExp('^\\s*@\\s*(' + command + ')(\\s|$)', 'i')
    return r.test(row)
  })
  return command as SUPPORTED_COMMAND | undefined
}

const splitRowComment = (row: string) => {
  const [trimmedRow] = row.split(/\/\//, 1)
  return [trimmedRow.trim(), row.substring(trimmedRow.length + 2)]
}
