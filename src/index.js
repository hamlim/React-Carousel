import React, { Component } from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import CarouselBase from './carouselbase.js'
import styles from './styles.css'

const Carousel = () => (
  <CarouselBase
    initialActiveIndex={1}
    render={({
      getSlideProps,
      getContainerProps,
      getPrevArrowProps,
      getNextArrowProps,
    }) => [
      <button key="prev" {...getPrevArrowProps()}>
        Previous
      </button>,
      <ul key="slider" {...getContainerProps({ className: 'Slider' })}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(item => (
          <li {...getSlideProps(item, { className: 'Slide' })}>👋🏼</li>
        ))}
      </ul>,
      <button key="next" {...getNextArrowProps()}>
        Next
      </button>,
    ]}
  />
)

const App = () => (
  <div>
    <Carousel />
    <h2>Start editing to see some magic happen {'\u2728'}</h2>
  </div>
)

render(<App />, document.getElementById('root'))
