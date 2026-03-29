import './NavMain.scss'
import React from 'react'
import { NavLink, Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import categories from '../products/Products/Categories.json';
import brands from '../products/Products/Brands.json'

export default function NavMain(){
    const menuList=categories;
    const brandList=brands;
    let location=useLocation().pathname;
    return (
        <div className="nav">
            <nav className="nav-main">
                <ul className="nav-main-ul">
                    <li className="nav-main-ul-li">
                        <NavLink to="/" className={(navData)=>(navData.isActive?"active-style":"none")} style={{color:'#515151'}}>Home</NavLink>
                    </li>
                    <li className="nav-main-ul-li">
                        <NavLink to="products" className={(navData)=>(navData.isActive?"active-style":"none")} style={{color:'#515151'}}>Categories
                        <i className='fa-solid fa-chevron-down icon-style'></i>
                        </NavLink>
                        <div className="nav-main-ul-li-dropdown">
                          <ul className="nav-main-ul-li-dropdown-sub"  style={{maxWidth:'fit-content'}}>
                            <li className="nav-main-ul-li-dropdown-sub-list" >
                              <ul className="nav-main-ul-li-dropdown-sub-list" >
                                {menuList.map((items,index) => {
                                  return (                       
                                    <li key = {items.id} className='nav-main-ul-li-dropdown-sub-items' >
                                      <Link to={`products/${items.id}`} className='nav-main-ul-li-dropdown-sub-items' >  {items.name}</Link>
                                    </li>
                                  )
                                })}
                              </ul>
                            </li>                          
                          </ul>
                        </div>
                    </li>
                    <li className="nav-main-ul-li">
                        <NavLink to="brands/1" className={(navData) => (navData.isActive ? "active-style" : 'none')} style={{color: '#515151'}}>Brands &nbsp;
                          <i className="fa-solid fa-chevron-down icon-style"></i>
                        </NavLink>
                        <div className="nav-main-ul-li-dropdown">
                          <ul className="nav-main-ul-li-dropdown-sub"  style={{maxWidth:'fit-content'}}>
                            <li className="nav-main-ul-li-dropdown-sub-list" >
                              <ul className="nav-main-ul-li-dropdown-sub-list" >
                                {brandList.map((items,index) => {
                                  return (
                                    <li key = {items.id} className='nav-main-ul-li-dropdown-sub-items' >
                                      <Link to={`brands/${items.id}`} className='nav-main-ul-li-dropdown-sub-items' >  {items.name}</Link>
                                    </li>
                                  )
                                })}
                              </ul>
                            </li>                          
                          </ul>
                        </div>
                    </li>
                    <li className="nav-main-ul-li">
                        <NavLink to="/contact" className={(navData) => (navData.isActive ? "active-style" : 'none')} style={{color: '#515151'}}>Contact</NavLink>
                    </li>
                    <li className="nav-main-ul-li">
                        <NavLink to="/about-us" className={(navData) => (navData.isActive ? "active-style" : 'none')} style={{color: '#515151'}}>About Us</NavLink>
                    </li>
                    <li className="nav-main-ul-li">
                        <NavLink to="/compare" className={(navData) => (navData.isActive ? "active-style" : 'none')} style={{color: '#515151'}}>Compare</NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    )
}