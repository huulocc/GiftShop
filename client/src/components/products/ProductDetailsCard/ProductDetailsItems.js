import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './ProductDetailsItems.scss'
import detailsicon from '../../../stories/icons/more-information.png'
import carticon from '../../../stories/icons/add-to-cart.png'
import compareicon from '../../../stories/icons/compare.png'
import CartManager from '../../../services/CartManager'


function ProductDetailsItems(props) {
    const item=props;
    const [showToast, setShowToast] = useState(false)

    const handleAddToCart = () => {
      const cart = CartManager.getInstance()
      cart.addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.images,
      })

      // Show toast feedback
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2500)
    }

  return (
    <div className="productdetails">
        <div className="productdetails-avatar">
            <div className='productdetails-avatar-flag'>
                <span className='productdetails-avatar-flag-text'>{item.status}</span>
            </div>
            <img src={item.images} alt='items' className='productdetails-avatar-img' />
        </div>
        <div className='productdetails-content'>
            <h4 className='productdetails-content-h4' >{item.name}</h4>
            <h5 className='productdetails-content-h5'>{item.categories}</h5>
            <h3 className='productdetails-content-h3'>Price :{item.price}$</h3>
        </div>
        <div className='productdetails-button' >
            <Link to={`./detail/${item.id}`} className='productdetails-button-details'>
                <p className='productdetails-button-p'>Details</p>
                <img src={detailsicon} alt="detailsicon" className='productdetails-button-icon'/>
            </Link>
            <button className='productdetails-button-addToCart' onClick={handleAddToCart}>
                <p  className='productdetails-button-p' >Add To Cart</p>
                <img src={carticon} alt="carticon" className='productdetails-button-icon' />
            </button>
            <button className='productdetails-button-addToCart'>
                <p  className='productdetails-button-p'>Compare</p>
                <img src={compareicon} alt="compareicon" className='productdetails-button-icon' />
            </button>
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="cart-toast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Added to cart!
          </div>
        )}
    </div>
    
  )
}

export default ProductDetailsItems