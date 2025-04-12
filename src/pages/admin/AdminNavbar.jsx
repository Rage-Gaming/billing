import React from 'react'
import logo from '../../assets/logo.png'
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <div className='flex px-10 py-2 rounded-xl justify-center items-center bg-[#eeeeee] navBar'>
      <div className='flex text-2xl font-bold items-center gap-5'>
        <img src={logo} alt="Logo" className='w-16 h-16' />
        <h1>Boundless</h1>
      </div>
    </div>
  )
}

export default NavBar