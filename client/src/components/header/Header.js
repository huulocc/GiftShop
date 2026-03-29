import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.scss';
import TopBars from './TopBars'
import NavMain from '../navigation/NavMain'


function Header() {
  return (
    <div className="header-active">
      <div className='topbar-nav-main'>
          <TopBars/>
          <NavMain />
      </div>
    </div>
  )
}

export default Header