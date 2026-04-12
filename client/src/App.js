import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './components/header/Header';
import FooterMain from './components/footer/FooterMain';
import Home from './components/home/Home';
import ContactUs from './components/contact/ContactUs';
import CreateOrderPage from './components/order/CreateOrderPage';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import CartPage from './components/cart/CartPage';
import PaymentResult from './components/payment/PaymentResult';

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
          <Route path="signin" element={<SignIn/>}/>
          <Route path="signup" element={<SignUp/>}/>
          <Route path="cart" element={<CartPage/>}/>
          <Route path="payment/return" element={<PaymentResult/>}/>
          <Route path="payment-result" element={<PaymentResult/>}/>
        </Routes>
        <FooterMain/>
      </div>      
    </Router>
  )
}

export default App