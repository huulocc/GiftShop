import './Home.scss'
import React from 'react'
import SlideShowHome from './SlideShowHome'
import BestSellers from './BestSellers'

function Home() {
  return (
    <div className='home'>
      <div className="home-preview">
        <SlideShowHome/>
      </div>
      <div className='home-content'>
        <BestSellers/>
      </div>
    </div>
  )
}

export default Home