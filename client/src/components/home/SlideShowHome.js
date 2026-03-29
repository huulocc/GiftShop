import { useState,useEffect } from 'react';
import './SlideShowHome.scss';
import slideData from './slideData.json' ;
import prev from '../../stories/icons/previous.png'
import next from '../../stories/icons/next.png'


function SlideShowHome() {
    const [slides ] = useState(slideData);
    const [slideCurrent,setSlideCurrent]=useState(0);
    let slidesLength=slides.length;
    const handlePrev=()=>{
        setSlideCurrent(slideCurrent===0?slidesLength-1:slideCurrent-1);
    }
    const handleNext=()=>{
        setSlideCurrent(slideCurrent===slidesLength-1?0:slideCurrent+1);
    }
    useEffect(()=>{
        const interval = setInterval(()=> {
          setSlideCurrent(slideCurrent === slidesLength - 1 ? 0 : slideCurrent + 1)
      },5000 );
        return () => clearInterval(interval);
      },[slideCurrent]);
  return (
    <div className='slides'>
        <div className='slideshow'>
            {
                slides.map((item,index)=>{
                    return(
                        <img src={item.image} alt={item.title} className={index===slideCurrent?"slideshow-img-active":"slideshow-img-freezer"} key={index}></img>
                    )
            })}
        </div>
        <div className="slideshow-preview">
            <div className="slideshow-preview-left">
                <button className="slideshow-preview-button" onClick={handlePrev}>
                    <img src={prev} alt="prev-button" className="slideshow-preview-button-previous"></img>
                </button>
            </div>
            <div className="slideshow-preview-center">
                {/* {slides.map((item, index) =>{
                    return( index === slideCurrent &&
                      <div key={index}>
                        <h2 className="slideshow-preview-center-title">{item.title}</h2>
                        <p dangerouslySetInnerHTML={{__html: item.content}}    className="slideshow-preview-center-content"/>
                      </div>
                    )
                })} */}
            </div>
            <div className="slideshow-preview-right">
                <button className="slideshow-preview-button" onClick={handleNext}>
                    <img src={next} alt="prev-button" className="slideshow-preview-button-next"></img>
                </button>
            </div>
        </div>
    </div>
  )
}

export default SlideShowHome