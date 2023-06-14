Example Script:

@ SET TIME_START 15:00
@ SET TIME_END 22:00
@ SET WEEKDAYS MON,TUE,WED,THU,FRI
@ SET WEEKDAYS MON-FRI
@ SET WEEKDAYS MON-WED, SUN
@ SET WEEKDAYS ALL

@ ADD COLUMN Didelė salė

@ ADD COLUMN #sale1 Didelė salė

@ ADD COLUMN
  id: 1
  name: Didelė salė
  order: 1
  disabled
  enabled: false

@ AT 2023-05-01
  @ FOR 1
  @ SET disabled

@ IN 2023-05-01 - 2023-06-01
  @ SET disabled
  @ WHERE COLUMN 1

@ IN 2023-05-01 - 2023-06-01
  @ SET disabled
  @ WHERE COLUMN
    id: 1

@ IN 2023-05-01 to 2023-06-01
  @ SET TIME_START 14:00

@ SINCE 2023-07-01
  @ SET TIME_END 22:30

@ ADD Salsa
  schedule: weekly fri
  start: 13:00
  duration: 60
  column: 1

@ ADD
  id: 1
  name: Salsa / Marvin / 20 Eur
  schedule: weekly fri
  start: 13:00
  duration: 60
  column: 1
  color: red

@ ADD #1 Salsa / Marvin / 20 Eur
  schedule: weekly mon, wed
  start: 18:30
  duration: 1h
  column: #sale1
  color: red
  disabled


@ SINCE 2023-09-01
  @ GET 1
  @ SET start: 14:00
