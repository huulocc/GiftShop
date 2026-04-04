import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './components/header/Header';
import FooterMain from './components/footer/FooterMain';
import Home from './components/home/Home';
import ContactUs from './components/contact/ContactUs';
import CreateOrderPage from './components/order/CreateOrderPage';
import ProductData from './components/products/Products/Products.json'

import React from 'react'

function App() {
  return (
    <Router>
      <div className="App">
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="contact" element={<ContactUs/>}/>
          <Route path="orders" element={<CreateOrderPage/>}/>
        </Routes>
        <FooterMain/>
      </div>      
    </Router>
  )
}

export default App