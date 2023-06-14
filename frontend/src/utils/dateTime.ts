export const padWithZero = (number: number) => {
  if (number.toString().length === 1) {
    return '0' + number.toString()
  }
  return number.toString()
}

export const minuteToTime = (value: number) => {
  const hours = Math.floor(value / 60)
  const minutes = value - hours * 60
  return hours + ':' + padWithZero(minutes)
}
