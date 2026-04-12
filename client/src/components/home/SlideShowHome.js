import { useState, useEffect, useCallback } from 'react';
import './SlideShowHome.scss';
import slideData from './slideData.json';

function SlideShowHome() {
  const [slides] = useState(slideData);
  const [slideCurrent, setSlideCurrent] = useState(0);
  const slidesLength = slides.length;

  const handlePrev = () => {
    setSlideCurrent(slideCurrent === 0 ? slidesLength - 1 : slideCurrent - 1);
  }

  const handleNext = useCallback(() => {
    setSlideCurrent(slideCurrent === slidesLength - 1 ? 0 : slideCurrent + 1);
  }, [slideCurrent, slidesLength]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [handleNext]);

  return (
    <div className='slides'>
      {/* Images with crossfade */}
      <div className='slideshow'>
        {slides.map((item, index) => (
          <img
            src={item.image}
            alt={item.title}
            className={`slideshow-img ${index === slideCurrent ? 'slideshow-img--active' : ''}`}
            key={index}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="slideshow-overlay" />

      {/* Text overlay */}
      <div className="slideshow-text">
        {slides.map((item, index) => (
          <div
            key={index}
            className={`slideshow-text-slide ${index === slideCurrent ? 'slideshow-text-slide--active' : ''}`}
          >
            <h2 className="slideshow-text-title">{item.title}</h2>
            <p className="slideshow-text-content">{item.content}</p>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <div className="slideshow-nav">
        <button
          className="slideshow-nav-btn slideshow-nav-btn--prev"
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          className="slideshow-nav-btn slideshow-nav-btn--next"
          onClick={handleNext}
          aria-label="Next slide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="slideshow-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`slideshow-dot ${index === slideCurrent ? 'slideshow-dot--active' : ''}`}
            onClick={() => setSlideCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default SlideShowHome