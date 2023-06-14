import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import moment, { type Moment } from 'moment'
import { COMMAND_MODIFIERS, SUPPORTED_COMMANDS, calendarCodeToCommandList, type CommandListEntry, type COMMAND_MODIFIER, type SUPPORTED_COMMAND } from '@/utils/calendar'
import { calendar as calendarDefaults } from '@/constants/calendar'
import { minuteToTime } from '@/utils/dateTime'
import { stringToBoolean } from '@/utils/stringToBoolean'

export interface CalendarColumn {
  id: string
  name: string
  isDefaultColumn: boolean
}

export interface CalendarColumnInner extends CalendarColumn {
  order: number
  disabled: boolean
  dateStart: string
  dateEnd: string
  dateSchedule: string
}

export interface CalendarTimeblockInner {
  id: string
  name: string
  schedule: string
  column: string
  color: string
  dateStart: string
  dateEnd: string
  dateSchedule: string
  disabled: boolean
  minuteStart: number
  minuteDuration: number
}

export interface CalendarTimeblock {
  id: string
  column: string
  minuteStart: number
  minuteDuration: number
  line: number
  linesCount: number
  position: Record<string, string>
  content: string[]
  color: string
}

export const useCalendarStore = defineStore('calendar', () => {
  const date = ref(moment().format('YYYY-MM-DD'))

  const dateStart = computed(() => moment(date.value).startOf('isoWeek').format('YYYY-MM-DD'))
  const dateEnd = computed(() => moment(date.value).endOf('isoWeek').format('YYYY-MM-DD'))

  const toggleDate = (direction: number) => {
    date.value = moment(date.value).startOf('isoWeek').add(direction, 'weeks').format('YYYY-MM-DD')
  }

  const weekLabel = computed(() => {
    const m1 = moment(dateStart.value)
    const m2 = moment(dateEnd.value)
    if (m1.format('YYYY-MM') === m2.format('YYYY-MM')) {
      return m1.format('MMM DD') + ' - ' + m2.format('DD')
    }
    if (m1.format('YYYY') === m2.format('YYYY')) {
      return m1.format('MMM DD') + ' - ' + m2.format('MMM DD')
    }
    return m1.format('DD.MM.YYYY') + ' - ' + m2.format('DD.MM.YYYY')
  })

  const code = ref('')

  const commandList = computed(() => calendarCodeToCommandList(code.value))

  const title = computed(() => {
    const command = commandList.value.find(command => command.type === SUPPORTED_COMMANDS.SET_TITLE)
    return command?.inlineValue || ''
  })

  const cellWidth = computed(() => {
    const command = commandList.value.find(command => command.type === SUPPORTED_COMMANDS.SET_CELL_WIDTH)
    if (command?.inlineValue && !isNaN(Number(command.inlineValue))) {
      return Number(command.inlineValue)
    } else {
      return calendarDefaults.cellWidth
    }
  })

  const cellHeight = computed(() => {
    const command = commandList.value.find(command => command.type === SUPPORTED_COMMANDS.SET_CELL_HEIGHT)
    if (command?.inlineValue && !isNaN(Number(command.inlineValue))) {
      return Number(command.inlineValue)
    } else {
      return calendarDefaults.cellHeight
    }
  })

  const timeSplit = computed(() => {
    const commandSplit = commandList.value.find(command => command.type === SUPPORTED_COMMANDS.SET_TIME_SPLIT)
    return timeDurationToMinute(commandSplit?.inlineValue) || calendarDefaults.timeSplit
  })

  const timeLabels = computed(() => {
    const commandStart = commandList.value.find(command => command.type === SUPPORTED_COMMANDS.SET_TIME_START)
    const minuteStart = Math.floor((timeStringToMinute(commandStart?.inlineValue) || calendarDefaults.minuteStart) / timeSplit.value) * timeSplit.value
    const commandEnd = commandList.value.find(command => command.type === SUPPORTED_COMMANDS.SET_TIME_END)
    const minuteEnd = Math.ceil((timeStringToMinute(commandEnd?.inlineValue) || calendarDefaults.minuteEnd) / timeSplit.value) * timeSplit.value
    const out: { key: number; value: string }[] = []
    for (let minute = minuteStart; minute <= minuteEnd && minute <= 24 * 3600; minute += timeSplit.value) {
      out.push({
        key: minute,
        value: minuteToTime(minute)
      })
    }
    out.unshift({ key: minuteStart - timeSplit.value, value: '' })
    return out
  })

  const minuteStart = computed(() => timeLabels.value?.[0]?.key || 0)

  const minuteDuration = computed(() => timeLabels.value?.[timeLabels.value.length - 1]?.key - minuteStart.value + timeSplit.value)

  const dates = computed(() => {
    const out: { key: string; value: string }[] = []
    const commandsSorted = getSortedCommands(commandList.value, SUPPORTED_COMMANDS.SET_WEEKDAYS, SUPPORTED_COMMANDS.UPDATE_WEEKDAYS)
    for (const m = moment(dateStart.value); m.isSameOrBefore(dateEnd.value); m.add(1, 'day')) {
      let weekdays = parseWeekdays('ALL')
      commandsSorted.forEach((command) => {
        if (!commandModifierFitsDate(command, m)) {
          return
        }
        const commandWeekdays = parseWeekdays(command.inlineValue || '')
        if (commandWeekdays.length) {
          weekdays = commandWeekdays
        }
      })
      if (weekdays.includes(Number(m.format('E')))) {
        out.push({
          key: m.format('YYYY-MM-DD'),
          value: m.format('ddd, DD.MM')
        })
      }
    }
    return out
  })

  const columnsByDates = computed(() => {
    const out: Record<string, CalendarColumn[]> = {}
    const createCommands = getSortedCommands(commandList.value, SUPPORTED_COMMANDS.CREATE_COLUMN)
    const updateCommands = getSortedCommands(commandList.value, SUPPORTED_COMMANDS.UPDATE_COLUMN)
    dates.value.forEach((date) => {
      const m = moment(date.key)
      const columnsByIds: Record<string, CalendarColumnInner> = {}
      createCommands.forEach((command) => {
        const column: CalendarColumnInner = {
          id: command.inlineEntryId || command.inlineValue || '',
          name: command.inlineValue || '',
          order: 0,
          dateStart: '',
          dateEnd: '',
          dateSchedule: command.modifiers?.find(modifier => modifier.type === COMMAND_MODIFIERS.WITH_SCHEDULE)?.value || '',
          disabled: false,
          isDefaultColumn: false
        }
        const modifier = command.modifiers?.find(modifier => ([COMMAND_MODIFIERS.AT, COMMAND_MODIFIERS.IN, COMMAND_MODIFIERS.SINCE] as COMMAND_MODIFIER[]).includes(modifier.type))
        if (modifier?.value && isModifierValidDateLike(modifier.value)) {
          const [m1, m2] = modifier.value.split(/(?:,| - )/).map(v => v.trim()).map(v => v ? moment(v) : undefined)
          if (m1?.isValid()) {
            column.dateStart = m1.format('YYYY-MM-DD')
          }
          if (modifier.type === COMMAND_MODIFIERS.IN && m2?.isValid()) {
            column.dateEnd = m2.format('YYYY-MM-DD')
          } else if (modifier.type === COMMAND_MODIFIERS.AT) {
            column.dateEnd = column.dateStart
          }
        }
        updateColumnWithOptions(column, command.options)
        if (column.id) {
          columnsByIds[column.id] = column
        }
      })
      updateCommands.forEach((command) => {
        const id = command.inlineEntryId || command.inlineValue || command.options.find(option => option.type === 'id')?.value || ''
        const column = columnsByIds[id]
        if (!column) {
          return
        }
        if (!commandModifierFitsDate(command, m)) {
          return
        }
        updateColumnWithOptions(column, command.options)
      })
      const columns = Object.values(columnsByIds)
        .filter((column) => {
          if (column.dateStart && m.isBefore(column.dateStart, 'date')) {
            return false
          }
          if (column.dateEnd && m.isAfter(column.dateEnd, 'date')) {
            return false
          }
          if (column.dateSchedule && !timeblockScheduleFitsDate(column.dateSchedule, m)) {
            return false
          }
          return !column.disabled
        })
        .sort((c1, c2) => c1.order - c2.order)
        .map(column => ({ id: column.id, name: column.name, isDefaultColumn: false }))
      if (columns.length) {
        out[date.key] = columns
      } else {
        out[date.key] = [{ id: '#default', name: '', isDefaultColumn: true }]
      }
    })
    return out
  })

  const timeblocksByDateAndColumns = computed(() => {
    const out: Record<string, CalendarTimeblock[]> = {}
    const createCommands = getSortedCommands(commandList.value, SUPPORTED_COMMANDS.CREATE)
    const updateCommands = getSortedCommands(commandList.value, SUPPORTED_COMMANDS.UPDATE)
    dates.value.forEach((date) => {
      const m = moment(date.key)
      const columns = columnsByDates.value[date.key] || []
      if (!columns.length) {
        return
      }
      const timeblocksByIds: Record<string, CalendarTimeblockInner> = {}
      createCommands.forEach((command) => {
        const timeblock: CalendarTimeblockInner = {
          id: command.inlineEntryId || command.inlineValue || '',
          name: command.inlineValue || '',
          schedule: '',
          column: '',
          color: '',
          dateStart: '',
          dateEnd: '',
          dateSchedule: command.modifiers?.find(modifier => modifier.type === COMMAND_MODIFIERS.WITH_SCHEDULE)?.value || '',
          disabled: false,
          minuteStart: 0,
          minuteDuration: 0
        }
        const modifier = command.modifiers?.find(modifier => ([COMMAND_MODIFIERS.AT, COMMAND_MODIFIERS.IN, COMMAND_MODIFIERS.SINCE] as COMMAND_MODIFIER[]).includes(modifier.type))
        if (modifier?.value && isModifierValidDateLike(modifier.value)) {
          const [m1, m2] = modifier.value.split(/(?:,| - )/).map(v => v.trim()).map(v => v ? moment(v) : undefined)
          if (m1?.isValid()) {
            timeblock.dateStart = m1.format('YYYY-MM-DD')
          }
          if (modifier.type === COMMAND_MODIFIERS.IN && m2?.isValid()) {
            timeblock.dateEnd = m2.format('YYYY-MM-DD')
          } else if (modifier.type === COMMAND_MODIFIERS.AT) {
            timeblock.dateEnd = timeblock.dateStart
          }
        }
        updateTimeblockWithOptions(timeblock, command.options)
        if (timeblock.id) {
          timeblocksByIds[timeblock.id] = timeblock
        }
      })
      updateCommands.forEach((command) => {
        const id = command.inlineEntryId || command.inlineValue || command.options.find(option => option.type === 'id')?.value || ''
        const timeblock = timeblocksByIds[id]
        if (!timeblock) {
          return
        }
        if (!commandModifierFitsDate(command, m)) {
          return
        }
        updateTimeblockWithOptions(timeblock, command.options)
      })
      const timeblocksByColumns: Record<string, CalendarTimeblock[]> = {}
      Object.values(timeblocksByIds).forEach((timeblock) => {
        if (timeblock.dateStart && m.isBefore(timeblock.dateStart, 'date')) {
          return
        }
        if (timeblock.dateEnd && m.isAfter(timeblock.dateEnd, 'date')) {
          return
        }
        if (timeblock.dateSchedule && !timeblockScheduleFitsDate(timeblock.dateSchedule, m)) {
          return
        }
        if (timeblock.disabled) {
          return
        }
        if (timeblock.minuteStart + timeblock.minuteDuration < minuteStart.value) {
          return
        }
        if (timeblock.minuteStart > minuteStart.value + minuteDuration.value) {
          return
        }
        if (!timeblock.column) {
          timeblock.column = columns[0].id
        }
        if (!columns.some(column => column.id === timeblock.column)) {
          return
        }
        if (!timeblockScheduleFitsDate(timeblock.schedule, m)) {
          return
        }
        if (!timeblocksByColumns[timeblock.column]) {
          timeblocksByColumns[timeblock.column] = []
        }
        timeblocksByColumns[timeblock.column].push({
          id: timeblock.id,
          column: timeblock.column,
          minuteStart: timeblock.minuteStart,
          minuteDuration: timeblock.minuteDuration,
          line: 0,
          linesCount: 1,
          position: {},
          content: timeblock.name.split(/\//).map(part => part.trim()).filter(part => part),
          color: timeblock.color
        })
      })
      Object.entries(timeblocksByColumns).forEach(([column, timeblocks]) => {
        out[date.key + '|' + column] = []
        placeTimeblocksOnLines(timeblocks)
        timeblocks.forEach((timeblock) => {
          timeblock.position = {
            top: (Math.max(0, Math.min(100, (timeblock.minuteStart - minuteStart.value) / minuteDuration.value * 100))) + '%',
            height: (Math.max(0, Math.min(100, timeblock.minuteDuration / minuteDuration.value * 100))) + '%',
            left: (timeblock.line / timeblock.linesCount * 100) + '%',
            width: (1 / timeblock.linesCount * 100) + '%',
            '--color': timeblock.color
          }
          out[date.key + '|' + column].push(timeblock)
        })
      })
    })
    return out
  })

  const sideHeight = computed(() => timeLabels.value.length * cellHeight.value )
  const bodyWidth = computed(() => dates.value.reduce((out, date) => out + (columnsByDates.value[date.key] || []).length * cellWidth.value, 0))

  return {
    date,
    toggleDate,
    weekLabel,
    code,
    commandList,
    title,
    cellWidth,
    cellHeight,
    timeLabels,
    dates,
    columnsByDates,
    timeblocksByDateAndColumns,
    sideHeight,
    bodyWidth
  }
})

const updateColumnWithOptions = (target: CalendarColumnInner, options: { type: string; value: string}[]) => {
  options.forEach(({ type, value }) => {
    type = type.toLowerCase()
    if (type === 'id') {
      target.id = value
    } else if (type === 'name') {
      target.name = value
    } else if (type === 'order' && value && !isNaN(Number(value))) {
      target.order = Number(value)
    } else if (/^date[_ ]?start$/.test(type) && value && moment(value).isValid()) {
      target.dateStart = moment(value).format('YYYY-MM-DD')
    } else if (/^date[_ ]?end$/.test(type) && value && moment(value).isValid()) {
      target.dateEnd = moment(value).format('YYYY-MM-DD')
    } else if (type === 'disabled') {
      target.disabled = stringToBoolean(value)
    } else if (type === 'enabled') {
      target.disabled = !stringToBoolean(value)
    }
  })
}

const updateTimeblockWithOptions = (target: CalendarTimeblockInner, options: { type: string; value: string }[]) => {
  options.forEach(({ type, value }) => {
    type = type.toLowerCase()
    if (type === 'id') {
      target.id = value
    } else if (type === 'name') {
      target.name = value
    } else if (/^date[_ ]?start$/.test(type) && value && moment(value).isValid()) {
      target.dateStart = moment(value).format('YYYY-MM-DD')
    } else if (/^date[_ ]?end$/.test(type) && value && moment(value).isValid()) {
      target.dateEnd = moment(value).format('YYYY-MM-DD')
    } else if (type === 'disabled') {
      target.disabled = stringToBoolean(value)
    } else if (type === 'enabled') {
      target.disabled = !stringToBoolean(value)
    } else if (type === 'schedule') {
      target.schedule = value
    } else if (type === 'start' && timeStringToMinute(value)) {
      target.minuteStart = timeStringToMinute(value)
    } else if (type === 'duration' && timeDurationToMinute(value)) {
      target.minuteDuration = timeDurationToMinute(value)
    } else if (type === 'column') {
      target.column = value
    } else if (type === 'color') {
      target.color = value
    }
  })
}

// MON=1, TUE=2, SUN=7
// For MON-WED, SUN returns [1, 2, 3, 7]
const parseWeekdays = (row: string) => {
  const dayString = 'mon|tue|wed|thu|fri|sat|sun'
  const days = dayString.split('|')
  const out: Record<string, true> = {}
  const parts = row.toLowerCase().split(',')
  parts.forEach((part) => {
    if (/\s*all\s*/.test(part)) {
      for (let i = 1; i <= 7; i++) {
        out[i] = true
      }
      return
    }
    const mRange = part.match(new RegExp('^\\s*(' + dayString + ')\\s*-\\s*(' + dayString + ')\\s*$'))
    if (mRange) {
      const indexStart = days.indexOf(mRange[1]) + 1
      const indexEnd = days.indexOf(mRange[2]) + 1
      if (indexStart && indexEnd && indexStart <= indexEnd) {
        for (let i = indexStart; i <= indexEnd; i++) {
          out[i] = true
        }
      }
      return
    }
    const mSingle = part.match(new RegExp('^\\s*(' + dayString + ')\\s*'))
    if (mSingle) {
      const index = days.indexOf(mSingle[1]) + 1
      if (index) {
        out[index] = true
      }
    }
  })
  return Object.keys(out).map(Number).sort((k1, k2) => k1 - k2)
}

const parseDays = (row: string) => {
  const out: Record<number, true> = {}
  const parts = row.toLowerCase().split(',')
  parts.forEach((part) => {
    if (!isNaN(Number(part))) {
      out[Number(part)] = true
      return
    }
    const mRange = part.match(new RegExp('^\\s*(\\d+)\\s*-\\s*(\\d+)\\s*$'))
    if (mRange) {
      for (let i = Number(mRange[1]); i <= Number(mRange[2]); i++) {
        out[i] = true
      }
      return
    }
  })
  return Object.keys(out).map(Number).sort((k1, k2) => k1 - k2)
}

const commandModifierFitsDate = (command: CommandListEntry, m: Moment) => {
  const scheduleModifier = command.modifiers?.find(modifier => modifier.type === COMMAND_MODIFIERS.WITH_SCHEDULE)?.value
  if (scheduleModifier && !timeblockScheduleFitsDate(scheduleModifier, m)) {
    return false
  }
  const modifier = command.modifiers?.find(modifier => ([COMMAND_MODIFIERS.AT, COMMAND_MODIFIERS.IN, COMMAND_MODIFIERS.SINCE] as COMMAND_MODIFIER[]).includes(modifier.type))
  if (modifier?.value && isModifierValidDateLike(modifier.value)) {
    const [m1, m2] = modifier.value.split(/(?:,| - )/).map(v => v.trim()).map(v => v ? moment(v) : undefined)
    if (m1?.isValid() && m1.isAfter(m, 'date')) {
      return false
    } else if (modifier.type === COMMAND_MODIFIERS.AT && m1?.isValid() && m1.isBefore(m, 'date')) {
      return false
    } else if (modifier.type === COMMAND_MODIFIERS.IN && m2?.isValid() && m2.isBefore(m, 'date')) {
      return false
    }
  }
  return true
}

const getSortedCommands = (commands: CommandListEntry[], createType: SUPPORTED_COMMAND | undefined, updateType?: SUPPORTED_COMMAND | undefined) => {
  return commands
    .filter(command => command.type === createType || command.type === updateType)
    .sort((c1, c2) => {
      const c1HasModifiers = c1.modifiers?.length ? 1 : 0
      const c2HasModifiers = c2.modifiers?.length ? 1 : 0
      if (c1HasModifiers !== c2HasModifiers) {
        return c1HasModifiers - c2HasModifiers
      }
      return (c1.type === updateType ? 1 : 0) - (c2.type === updateType ? 1 : 0)
    })
}

const isModifierValidDateLike = (value?: string | undefined) => {
  if (!value) {
    return false
  }
  const [m1, m2] = value.split(/(?:,| - )/).map(v => v.trim()).map(v => v ? moment(v) : undefined)
  return m1 && m1.isValid() && (!m2 || m2.isValid())
}

const timeStringToMinute = (value?: string | undefined) => {
  const m = value?.match(/^(\d+):(\d+)$/)
  if (m) {
    return Number(m[1]) * 60 + Number(m[2])
  }
  return 0
}

const timeDurationToMinute = (value?: string | undefined) => {
  const m = value?.match(/^(\d+(\.\d+)?)(h|m)?$/i)
  if (m) {
    return Number(m[1]) * (m[3] === 'h' ? 60 : 1)
  }
  return 0
}

const timeblockScheduleFitsDate = (schedule: string, m: Moment) => {
  if (/^monthly /i.test(schedule)) {
    schedule = schedule.substring(8)
    const days = parseDays(schedule)
    console.log('here2', schedule, days, m.format('DD'), days.includes(Number(m.format('DD'))))
    return days.includes(Number(m.format('DD')))
  } else {
    schedule = schedule.replace(/^weekly /i, '')
    const weekdays = parseWeekdays(schedule)
    return weekdays.includes(Number(m.format('E')))
  }
}

const placeTimeblocksOnLines = (timeblocks: CalendarTimeblock[]) => {
  const lines: CalendarTimeblock[][] = []
  timeblocks.forEach((timeblock) => {
    let lineIndex = lines.findIndex((timeblocksOnTheLine) => {
      return !timeblocksOnTheLine.some(lineTimeblock => timeblocksIntersect(lineTimeblock, timeblock))
    })
    if (lineIndex === -1) {
      lineIndex = lines.length
      lines.push([])
    }
    timeblock.line = lineIndex
    lines[lineIndex].push(timeblock)
  })
  timeblocks.forEach(timeblock => {
    timeblock.linesCount = lines.length
  })
}

const timeblocksIntersect = (t1: CalendarTimeblock, t2: CalendarTimeblock) => {
  return Math.min(t1.minuteStart + t1.minuteDuration, t2.minuteStart + t2.minuteDuration) - Math.max(t1.minuteStart, t2.minuteStart) > 0
}
