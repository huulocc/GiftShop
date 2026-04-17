import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ProductDetailsItems.scss'
import detailsicon from '../../../stories/icons/more-information.png'
import carticon from '../../../stories/icons/add-to-cart.png'
import compareicon from '../../../stories/icons/compare.png'
import CartManager from '../../../services/CartManager'
import { useCompare } from '../../../contexts/CompareContext'
import productService from '../../../services/productService'
import { useAuth } from '../../../services/AuthContext'

function ProductDetailsItems(props) {
    const item = props;
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [showToast, setShowToast] = useState(false)
    const [toastMsg, setToastMsg] = useState('')
    const [compareLoading, setCompareLoading] = useState(false)
    const { addToCompare, removeFromCompare, isInCompare } = useCompare()
    const inCompare = isInCompare(item.id)

    const handleCompare = async () => {
      if (inCompare) {
        removeFromCompare(item.id)
        return
      }
      setCompareLoading(true)
      try {
        const res = await productService.getById(item.id)
        if (res.success && res.data) {
          addToCompare(res.data)
        }
      } catch (err) {
        console.error('Compare fetch failed:', err)
      } finally {
        setCompareLoading(false)
      }
    }

    const handleAddToCart = () => {
      if (!isAuthenticated) {
        setToastMsg('Please log in to add items to your cart.')
        setShowToast(true)
        setTimeout(() => { setShowToast(false); navigate('/login') }, 1800)
        return
      }
      const cart = CartManager.getInstance()
      cart.addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.images,
      })
      setToastMsg('Added to cart!')
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
            <Link to={`/product/${item.id}`} className='productdetails-button-details'>
                <p className='productdetails-button-p'>Details</p>
                <img src={detailsicon} alt="detailsicon" className='productdetails-button-icon'/>
            </Link>
            <button className='productdetails-button-addToCart' onClick={handleAddToCart}>
                <p  className='productdetails-button-p' >Add To Cart</p>
                <img src={carticon} alt="carticon" className='productdetails-button-icon' />
            </button>
            <button
                className={`productdetails-button-addToCart${inCompare ? ' productdetails-button--comparing' : ''}`}
                onClick={handleCompare}
                disabled={compareLoading}
            >
                <p className='productdetails-button-p'>
                  {compareLoading ? '...' : inCompare ? '✓ Comparing' : 'Compare'}
                </p>
                <img src={compareicon} alt="compareicon" className='productdetails-button-icon' />
            </button>
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className={`cart-toast${!isAuthenticated ? ' cart-toast--warn' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isAuthenticated
                ? <path d="M20 6L9 17l-5-5"/>
                : <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>
              }
            </svg>
            {toastMsg}
          </div>
        )}
    </div>
    
  )
}

export default ProductDetailsItems