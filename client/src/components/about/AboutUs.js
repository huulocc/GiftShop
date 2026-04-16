import React from 'react'
import './AboutUs.scss'

function AboutUs() {
  return (
    <section className='about-us-page'>
      <div className='about-us-page__container'>
        <header className='about-us-page__hero'>
          <h1>About Us</h1>
          <p>
            We create meaningful gifts for every special moment, with thoughtful design,
            quality materials, and warm customer care.
          </p>
        </header>

        <div className='about-us-page__grid'>
          <article className='about-us-page__card'>
            <h2>Our Mission</h2>
            <p>
              Bring people closer through personalized gifts that celebrate memories,
              milestones, and everyday joy.
            </p>
          </article>

          <article className='about-us-page__card'>
            <h2>What We Value</h2>
            <p>
              Creativity, reliability, and honest service. Every order is handled with care
              from product selection to delivery.
            </p>
          </article>

          <article className='about-us-page__card'>
            <h2>Why GiftShop</h2>
            <p>
              Curated collections, easy ordering, and dedicated support to help you find the
              right gift quickly.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default AboutUs
