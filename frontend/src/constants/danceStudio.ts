export const defaultCode = `@ SET_TITLE Bachata Fever
@ SET_TIME_START 18:30
@ SET_TIME_END 21:30
@ SET_TIME_SPLIT 30m
@ SET_WEEKDAYS MON-THU
@ SET_CELL_WIDTH 150
@ SET_CELL_HEIGHT 100

@ CREATE_COLUMN $A Studio A
@ CREATE_COLUMN $B Studio B

@ CREATE $kf Kizomba Fusion / (free 30 min) / Azael & Sindi
  schedule: MON
  start: 19:00
  duration: 30m
  color: #84cc16
  column: $A

@ CREATE $kb Kizomba Beginners / Mishel & Laura
  schedule: MON, WED
  start: 19:30
  duration: 1h
  color: #f59e0b
  column: $A

@ CREATE $bi Bachata Improvers / (3+ month exp.) / Denis & Dovile
  schedule: MON, WED
  start: 20:30
  duration: 1h
  color: #ec4899
  column: $A

@ CREATE $tt Teachers Training
  schedule: MON
  start: 19:00
  duration: 30m
  color: #6366f1
  column: $B

@ CREATE $kf Kizomba Fusion / (Improvers) / Edvardas & Rasa
  schedule: MON, WED
  start: 19:30
  duration: 1h
  color: #ec4899
  column: $B

@ CREATE $uki Urban Kiz Intensive / (Intermediate) / Mishel & Laura
  schedule: MON, WED
  start: 20:30
  duration: 1h
  color: #0ea5e9
  column: $B

@ CREATE $bb2 Bachata Beginners 2 / Azael & Ieva
  schedule: TUE, THU
  start: 18:30
  duration: 1h
  color: #f59e0b
  column: $A

// @ UPDATE $bb2 SINCE 2023-06-01 WITH_SCHEDULE monthly 8-16
@ UPDATE $bb2 SINCE 2023-06-01 WITH_SCHEDULE THU
  column: $B

@ CREATE $bnb Bachata New Beginners / Denis & Dovile
  schedule: TUE, THU
  start: 19:30
  duration: 1h
  color: #f59e0b
  column: $A

@ CREATE $bsi Bachata Sensual Intensive / (Intermediate) / Azael & Sindi
  schedule: TUE, THU
  start: 20:30
  duration: 1h
  color: #0ea5e9
  column: $A

@ UPDATE $bsi WITH_SCHEDULE THU
  name: Bachata Sensual Intensive / (Intermediate) / Azael & Ieva

@ CREATE $bls Bachata Lady Styling / (Open level) / Sindi
  schedule: TUE, WED
  start: 18:30
  duration: 1h
  color: #84cc16
  column: $B

@ UPDATE $bls WITH_SCHEDULE WED
  name: Bachata Lady Styling / (Beginners) / Ieva
  column: $A

@ CREATE $bpc You can book a private class / Bachata - Kizomba - Salsa
  schedule: TUE, WED, THU
  start: 19:30 // TODO: implement "start: 19:30, 20:30" ?
  duration: 1h
  color: #6366f1
  column: $B

@ UPDATE $bpc WITH_SCHEDULE WED
  start: 18:30

@ CREATE $bpc2 You can book a private class / Bachata - Kizomba - Salsa
  schedule: TUE
  start: 20:30
  duration: 1h
  color: #6366f1
  column: $B

@ CREATE $gus Get Your Splits / (Open level) / Sindi
  schedule: THU
  start: 18:30
  duration: 1h
  color: #84cc16
  column: $A
`
