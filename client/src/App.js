import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './components/header/Header';
import FooterMain from './components/footer/FooterMain';
import Home from './components/home/Home';
import ContactUs from './components/contact/ContactUs';
import CreateOrderPage from './components/order/CreateOrderPage';
import CartPage from './components/cart/CartPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ProfilePage from './components/profile/ProfilePage';
import ManagerDashboard from './components/manager/ManagerDashboard';
import SearchResults from './components/search/SearchResults';
import ComparePage from './components/products/ComparePage';
import { AuthProvider } from './services/AuthContext';
import { CheckoutProvider } from './contexts/CheckoutContext';
import { CompareProvider } from './contexts/CompareContext';

import React from 'react'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CheckoutProvider>
          <CompareProvider>
            <div className="App">
              <Header/>
              <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="contact" element={<ContactUs/>}/>
                <Route path="orders" element={<CreateOrderPage/>}/>
                <Route path="cart" element={<CartPage/>}/>
                <Route path="compare" element={<ComparePage/>}/>
                <Route path="login" element={<LoginPage/>}/>
                <Route path="register" element={<RegisterPage/>}/>
                <Route path="manager" element={<ManagerDashboard/>}/>
                <Route path="profile" element={<ProfilePage/>}/>
                <Route path="search" element={<SearchResults/>}/>
              </Routes>
              <FooterMain/>
            </div>
          </CompareProvider>
        </CheckoutProvider>
      </AuthProvider>
    </Router>
  )
}

export default App