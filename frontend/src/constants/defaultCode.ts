import moment from 'moment'
const wedDate = moment().startOf('isoWeek').add(2, 'days').format('YYYY-MM-DD')

export const defaultCode = `
@ SET_TITLE Sample TimeTable
@ SET_TIME_START 18:00
@ SET_TIME_END 21:00
@ SET_TIME_SPLIT 30m // Horizontal lines will go every 30 minutes
@ SET_WEEKDAYS MON, WED // MON-FRI, ALL also allowed

@ CREATE_COLUMN $A Studio A // Everything starting with $ means the reference (id)
@ CREATE_COLUMN $B Studio B

@ CREATE $t1 Sample TimeBlock / With Optional Description / On several lines
  schedule: MON, WED
  start: 18:00
  duration: 1h
  color: #84cc16
  column: $A

@ UPDATE $t1 WITH_SCHEDULE WED
  column: $B

@ CREATE $t2 Timeblock, temporarily disabled on WED
  schedule: MON, WED
  start: 19:00
  duration: 30m
  color: #f59e0b
  column: $B

@ UPDATE $t2 AT ${wedDate}
  disabled: true

`.trim() + "\n"
