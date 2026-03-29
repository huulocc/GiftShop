import React from 'react'
import './BestSellers.scss'
import Products from '../products/Products/Products.json'
import { Link } from 'react-router-dom'
import ProductDetailsItems from '../products/ProductDetailsCard/ProductDetailsItems';

function BestSellers() {
    let topProducts = Products.filter((items) => items.top ===1);
    console.log(topProducts);
  return (
    <div className='bestsaler'>
        <h3>Best Salers</h3>
        <h5 className='bestsaler-button'>
           <Link to="/products" >
                More... &nbsp;
                <i className="fa-solid fa-arrow-right"></i>
            </Link>
        </h5>
        <div className='bestsaler-container'>
            {topProducts.map((items,index) =>{
                return(
                    <div className='bestsaler-container-item' key={index}>
                        <ProductDetailsItems id={items.id} name={items.name} price={items.price} status={items.status} brand={items.brand.name} images={items.images[0].path}/>
                    </div>

                )
            })}
            
        </div>
    </div>
  )
}

export default BestSellers