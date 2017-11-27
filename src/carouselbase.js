import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import {
  getAllyHandler,
  getPrevArrowPropDefaults,
  getNextArrowPropDefaults,
  getSliderDefaults,
  getContainerDefaults,
  deriveX,
  deriveY,
} from './carousel_utils.js'

const POINTER_JUMP_FACTOR = 5

class CarouselBase extends Component {
  static propTypes = {
    initialActiveIndex: PropTypes.number,
    activeIndex: PropTypes.number,
    render: PropTypes.func.isRequired,
    onSlideChange: PropTypes.func,
  }
  static defaultProps = {
    initialActiveIndex: 0,
    activeIndex: 0,
    onSlideChange() {},
  }
  state = {
    activeSlide: this.props.initialActiveIndex,
  }

  isControlled = () => this.props.activeIndex != null

  componentDidUpdate() {
    // @TODO need to implement
  }

  getClickHandler = (maybeFunc = () => {}) => id => event => {
    this.setState(
      s => ({
        activeSlide: id,
      }),
      maybeFunc,
    )
  }

  maxIndex = () => Object.keys(this.items).length - 1

  scrollTo = (
    index,
    { skipAnimation = false, skipScroll = false, onlyScrollIntoView = false },
  ) => {
    if (skipScroll) {
      return
    }
    window.requestAnimationFrame(() => {
      const clampedIndex =
        index > this.maxIndex() ? this.maxIndex() : index < 0 ? 0 : index
      const x = this.items[clampedIndex].boundingBox
      // leaving right here @todo
      const parentScroll = this.container
    })
  }

  nearestItemIndex = () => {
    const parentBox = this.container.boundingBox
    let closestLeft = Infinity
    let closestIndex = 0
    const numberOfChildren = Object.keys(this.items).length

    for (let i = 0; i < numberOfChildren; i++) {
      const { node, boundingBox } = this.items[i]
      const diff = Math.abs(boundingBox.left - parentBox.left)
      if (diff < closestLeft) {
        closestLeft = diff
        closestIndex = i
      } else if (isFinite(closestLeft)) {
        break
      }
    }
    return closestIndex
  }

  translateFn = () => (this.props.vertical ? 'translateY' : 'translateX')

  handleTouchStart = (maybeHandler = null) => event => {
    if (maybeHandler) {
      maybeHandler(event)
    }
    this._pointerData = {
      active: true,
      previousX: deriveX(event),
      previousY: deriveY(event),
      v: 0,
      a: 0,
      t: Date.now(),
    }
  }

  handleTouchMove = (maybeHandler = null) => event => {
    if (maybeHandler) {
      maybeHandler(event)
    }
    const currentX = deriveX(event)
    const currentY = deriveY(event)
    const now = Date.now()
    const dx = this._pointerData.previousX - currentX
    const dy = this._pointerData.previousY - currentY
    const dt = now - this._pointerData.t
    const direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'

    if (
      (this.props.vertical && direction === 'horizontal') ||
      (!this.props.vertical && direction === 'vertical')
    ) {
      return
    } else {
      event.preventDefault()
    }

    if (!this._pointerData.active) {
      return
    }

    const v = dx / dt
    this._pointerData.a = (v - this._pointerData.v) / dt
    this._pointerData.v = v
    this._pointerData.previousX = currentX
    this._currentAbsolutePosition += dx
    this.container.node.transform = `${this.translateFn()}(${-this
      ._currentAbsolutePosition}px`
    this._pointerData.hasMoved = true
  }

  handleTouchEnd = (maybeHandler = null) => event => {
    if (maybeHandler) {
      maybeHandler(event)
    }
    if (!this._pointerData.active || !this._pointerData.hasMoved) {
      return
    }
    this._pointerData.active = false
    this._pointerData.hasMoved = false
    const activeIndex = this.nearestItemIndex()
    let finalIndex = activeIndex
    if (Math.abs(this._pointerData.v) > 0.003) {
      finalIndex += Math.floor(this._pointerData.v / POINTER_JUMP_FACTOR)
      finalIndex +=
        this._pointerData.v === 0 ? 0 : this._pointerData.v > 0 ? 1 : -1
    }

    this.scrollTo(finalIndex)
  }

  // Getters to get the props for each core UI element
  getPrevArrowProps = (defaults = getPrevArrowPropDefaults()) => ({
    ...defaults,
    className: cx(
      'Carousel-previous',
      defaults.className ? defaults.className : null,
    ),
    onClick: this.onPrevClick,
  })
  getNextArrowProps = (defaults = getNextArrowPropDefaults()) => ({
    ...defaults,
    className: cx(
      'Carousel-next',
      defaults.className ? defaults.className : null,
    ),
    onClick: this.onPrevClick,
  })

  // --- Slides ---

  // Refs for each item in the slider
  items = {}
  // Ref for the container containing each item
  constainer = {}

  // assign the ref for each slide
  asssignItemRef = (identifier, maybeRef = null) => node => {
    if (node) {
      if (maybeRef) {
        maybeRef(node)
      }
      this.items[identifier] = {
        node,
        boundingBox: node.getBoundingClientRect(),
      }
    }
  }

  getSlideProps = (identifier, defaults = getSliderDefaults()) => {
    if (defaults.isInactive) {
      const { isInactive, ref, ...rest } = defaults
      return {
        ...rest,
        ref: this.asssignItemRef(identifier, ref),
      }
    } else {
      const { ref, ...rest } = defaults
      return {
        ...rest,
        role: 'button',
        tabIndex: '0',
        onKeyPress: getAllyHandler(
          this.getClickHandler(defaults.onClick)(identifier),
        ),
        onClick: this.getClickHandler(defaults.onClick)(identifier),
        ref: this.asssignItemRef(identifier, ref),
      }
    }
  }

  // --- Container ---

  getContainerRef = (maybeRef = null) => node => {
    if (node) {
      if (maybeRef) {
        maybeRef(node)
      }
      this.container = {
        node,
        boundingBox: node.getBoundingClientRect(),
      }
    }
  }
  getContainerProps = (defaults = getContainerDefaults()) => {
    const { ref, ...rest } = defaults
    return {
      ...rest,
      onTouchStart: this.handleTouchStart(
        rest.onTouchStart ? rest.onTouchStart : null,
      ),
      onTouchMove: this.handleTouchMove(
        rest.onTouchMove ? rest.onTouchMove : null,
      ),
      onTouchEnd: this.handleTouchEnd(rest.onTouchEnd ? rest.onTouchEnd : null),
      ref: this.getContainerRef(ref),
    }
  }

  // --- Render ---

  render() {
    return this.props.render({
      getSlideProps: this.getSlideProps,
      getContainerProps: this.getContainerProps,
      getPrevArrowProps: this.getPrevArrowProps,
      getNextArrowProps: this.getNextArrowProps,
    })
  }
}
export default CarouselBase
