import React from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductDetailsItems from './ProductDetailsCard/ProductDetailsItems'
import Products from './Products/Products.json'
import './ProductsPage.scss'

function ProductsPage() {
  const [searchParams] = useSearchParams()
  const brandFilter = searchParams.get('brand')
  const categoryFilter = searchParams.get('category')

  const visibleProducts = Products.filter((item) => {
    const matchesBrand = brandFilter ? String(item.brand?.id) === brandFilter : true
    const matchesCategory = categoryFilter ? String(item.categories?.id) === categoryFilter : true
    return matchesBrand && matchesCategory
  })

  const pageTitle = visibleProducts.length > 0
    ? (categoryFilter
      ? `Category: ${visibleProducts[0].categories?.name || 'Products'}`
      : (brandFilter ? `Brand: ${visibleProducts[0].brand?.name || 'Products'}` : 'All Products'))
    : 'Filtered Products'

  const pageSubtitle = brandFilter || categoryFilter
    ? 'Showing products that match your selected footer link'
    : 'Discover our full gift collection'

  return (
    <div className='products-page'>
      <div className='products-page__container'>
        <div className='products-page__header'>
          <h1 className='products-page__title'>{pageTitle}</h1>
          <p className='products-page__subtitle'>{pageSubtitle}</p>
        </div>

        <div className='products-page__grid'>
          {visibleProducts.map((item) => (
            <div className='products-page__item' key={item.id}>
              <ProductDetailsItems
                id={item.id}
                name={item.name}
                price={item.price}
                status={item.status}
                categories={item.categories?.name}
                images={item.images[0].path}
              />
            </div>
          ))}
        </div>

        {visibleProducts.length === 0 && (
          <div className='products-page__empty'>
            No products found for this filter.
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
