export const defaultCode = `@ SET_TITLE Artoteka - Tvarkaraštis
@ SET_TIME_START 12:00
@ SET_TIME_END 20:00
@ SET_TIME_SPLIT 1h
@ SET_WEEKDAYS MON-SAT
@ SET_CELL_WIDTH 150

@ CREATE_COLUMN $1 1 kamb
@ CREATE_COLUMN $2 2 kamb
@ CREATE_COLUMN $3 3 kamb
@ CREATE_COLUMN $4 4 kamb
@ CREATE_COLUMN $sale salė

@ CREATE $smilkalai Smilkalų gamyba iš vaistažolių ir prieskonių / nemokamas / skirtas senjorams
  schedule: weekly MON
  start: 12:00
  duration: 2h
  column: $3
  color: #5ab05a

@ CREATE $keramika Keramika: lipdymas ir glazūravimas / 20 EUR
  schedule: weekly MON, WED
  start: 18:00
  duration: 90m
  column: $1
  color: #5b72a2

@ CREATE $ebru Ebru (tapyba ant vandens) / 20 EUR
  schedule: MON
  start: 18:00
  duration: 2h
  column: $2
  color: #cb8f68

@ CREATE $mozaika Mozaikos žibintų dirbtuvės / 20 EUR
  schedule: MON
  start: 18:00
  duration: 2h
  column: $4
  color: #9e78c2

@ CREATE $sibori Šibori - tekstilės dažymo dirbtuvės / 20 EUR
  schedule: MON
  start: 18:00
  duration: 1.5h
  column: $3
  color: #5ab05a

@ CREATE $zvakes Sojų vaško žvakių dirbtuvės / 20 EUR
  schedule: MON
  start: 18:00
  duration: 2h
  column: $sale
  color: #d8d86d


@ CREATE Salsa
  schedule: weekly WED-FRI
  start: 13:00
  duration: 60
  column: $sale1

@ CREATE $1
  name: Salsa / Marvin / 20 Eur
  schedule: weekly FRI
  start: 13:00
  duration: 60
  column: $1
  color: red
  dateStart: 2023-05-01

@ CREATE $2 Salsa / Marvin / 20 Eur SINCE 2023-01-01
  schedule: weekly MON, WED
  start: 18:30
  duration: 1h
  column: $sale1
  color: #FFF000
  enabled: false

@ UPDATE Salsa AT 2023-06-14
  start: 14:00
`
