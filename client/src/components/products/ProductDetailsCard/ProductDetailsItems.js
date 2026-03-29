import React from 'react'
import { Link } from 'react-router-dom'
import './ProductDetailsItems.scss'
import detailsicon from '../../../stories/icons/more-information.png'
import carticon from '../../../stories/icons/add-to-cart.png'
import compareicon from '../../../stories/icons/compare.png'


function ProductDetailsItems(props) {
    const item=props;
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
            <h5 className='productdetails-content-h5'>{item.brand}</h5>
            <h3 className='productdetails-content-h3'>Price :{item.price}$</h3>
        </div>
        <div className='productdetails-button' >
            <Link to={`./detail/${item.id}`} className='productdetails-button-details'>
                <button className='productdetails-button-details'>
                    <p  className='productdetails-button-p'>Details</p>
                    <img src={detailsicon} alt="detailsicon" className='productdetails-button-icon'/>
                </button>
            </Link>
            <button className='productdetails-button-addToCart'>
                <p  className='productdetails-button-p' >Add To Cart</p>
                <img src={carticon} alt="carticon" className='productdetails-button-icon' />
            </button>
            <button className='productdetails-button-addToCart'>
                <p  className='productdetails-button-p'>Compare</p>
                <img src={compareicon} alt="compareicon" className='productdetails-button-icon' />
            </button>
        </div>
    </div>
    
  )
}

export default ProductDetailsItems