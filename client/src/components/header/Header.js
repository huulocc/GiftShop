import React from 'react';
import './Header.scss';
import TopBars from './TopBars'
import NavMain from '../navigation/NavMain'


function Header() {
  return (
    <header className="header">
      <div className='header-inner'>
        <TopBars/>
        <NavMain />
      </div>
    </header>
  )
}

export default Header