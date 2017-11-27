const ENTER = 13
export const getAllyHandler = func => event =>
  event.keyCode === ENTER && func(event)

export const getPrevArrowPropDefaults = () => ({})

export const getNextArrowPropDefaults = () => ({})

export const getSliderDefaults = () => ({})
export const getContainerDefaults = () => ({})

// Helpful event utils
export const deriveX = event =>
  event.touches ? event.touches[0].screenX : e.screenX
export const deriveY = event =>
  event.touches ? event.touches[0].screenY : e.screenY
