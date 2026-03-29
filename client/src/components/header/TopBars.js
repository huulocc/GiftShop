import React from "react";
import { useLocation, Link } from 'react-router-dom';
import "./TopBars.scss";
import Search from "./Search";
import LogoMain from "./LogoMain"
import '../../styles/VariableStyle.scss'

function TopBars({handleSeachProduct,indexofCart,handlelogin,registerUser}) {
  let location = useLocation().pathname;
 
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <LogoMain />
      </div>
      <div className="top-bar-center">
        <Search handleSeachProduct={handleSeachProduct}/>
      </div>
      <div className="top-bar-right">
        <div className="title-bar" style={{color: '#515151'}} onClick={()=>handlelogin()}>
            <p>{ registerUser !== undefined ? registerUser.name : ''}</p> &ensp;
            <i className="fa-solid fa-user cart" style={{color: '#515151'}}>&nbsp;</i>
        </div>
        <div className="top-bar-right-cart" >
          <Link to='/cart'>
            <i className="fa-solid fa-cart-plus cart" style={{color: '#515151'}}>&emsp;</i>
          </Link>
          <div className="top-bar-right-cart-index" ><p style={{color: indexofCart===0? '#cecece' : null }}>+{indexofCart}</p></div>
        </div>
        <div className="top-bar-find" >
          <Link to='/stores'>
            <i className="fa-solid fa-location-dot cart" style={{color: '#515151'}}>&emsp;</i>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default TopBars;
