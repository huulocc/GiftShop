import React from 'react'
import './ContactUs.scss'
import image4 from '../../assets/images/ContactUs/1.webp'

function ContactUs() {
  window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
  return (
    <div className='contact'>
        <div className="contact-banner">
            <img className='contact-banner-img' src={image4} alt="banner" />
            <div className="contact-banner-cover">
                <h1>Contact Us</h1>
            </div>
        </div>  
        <div className='contact-wrapper'>
          <br/>
          <p>For all enquiries please use the below form to contact your closest store who will get in contact shortly. Your closest store is your service point and can assist you on claims, product information, availability, delivery, prices, and more. If you are enquiring about an order, please choose the store where you made the purchase. If you are unsure which store that is, or if that store has closed, then please choose your closest store.</p>
          <div className='contact-wrapper-info'>
              <form action="/" className='contact-wrapper-info'>
              <input type="text" className='text-input' required placeholder='FIRST NAME:' /><br/>
              <input type="text" className='text-input' required placeholder='LAST NAME:' /><br/>
              <input type="number" className='text-input' required placeholder='PHONE:' /><br/>
              <textarea id="contact" name="contact" rows="2" cols="50" required className='text-area' placeholder='Message' />
              <input type="text" className='text-input' required placeholder='YOUR EMAIL:' /><br/>
              <input type="submit" value='Send' className='submit-button' onSubmit={(event)=>(alert('Thank you, your request has been received! We will contact you very soon.!'))}/>
              </form>
          </div>
          <div className='contact-wrapper-content'>
                <div className='contact-wrapper-content-address'>
                    <h3>Headquarters</h3>
                    <p>
                        <i className="fa-solid fa-location-dot"></i>
                        <strong>&nbsp;Address:&nbsp;&nbsp;&nbsp;</strong>
                        590 D. Cach Mang Thang 8, Ward 11, District 3, Ho Chi Minh City
                    </p>
                    <p>
                        <i className="fa-solid fa-phone"></i>
                        <strong>&nbsp; Phone:&nbsp;&nbsp;&nbsp;</strong>
                        097 729 8513
                    </p>
                    <p>
                        <i className="fa-solid fa-at"></i>
                        <strong>&nbsp; Email:&nbsp;&nbsp;&nbsp;</strong>
                        durableFurnitures@email.com.vn
                    </p>
                   
                </div>
                <div className='contact-wrapper-content-map'>
                    <iframe title="map" src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d979.830153144561!2d106.66551812845046!3d10.786737916740972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2s!4v1696304006211!5m2!1svi!2s" width="100%" height="200" style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
          </div>
        </div>
    </div>
  )
}

export default ContactUs