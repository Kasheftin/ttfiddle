export const getEventCoords = (e: UIEvent) => {
  let pageX = 0
  let pageY = 0
  if (window.TouchEvent && e instanceof TouchEvent && e.changedTouches && e.changedTouches.length > 0) {
    pageX = e.changedTouches[0].pageX
    pageY = e.changedTouches[0].pageY
  } else if (window.TouchEvent && e instanceof TouchEvent && e.touches && e.touches.length > 0) {
    pageX = e.touches[0].pageX
    pageY = e.touches[0].pageY
  } else if (window.MouseEvent && e instanceof MouseEvent) {
    pageX = e.pageX
    pageY = e.pageY
  }
  return { pageX, pageY }
}
