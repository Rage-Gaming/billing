import React from 'react'
import logo from '../assets/logo.png'
import { useNavigate, } from "react-router-dom";
import HoverDropDown from './HoverDropdown';

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <div className='flex px-10 py-2 rounded-xl justify-between items-center bg-[#eeeeee] printDisable'>
      <div className='flex text-2xl font-bold items-center gap-5'>
        <img src={logo} alt="Logo" className='w-16 h-16' />
        <h1>Boundless</h1>
      </div>
        <div className='flex items-center justify-between gap-10 text-[#242424] font-bold'>
            <h1 className='cursor-pointer hover:text-[#c91616]' onClick={() => navigate("/customer")}>New Invoice</h1>
            <h1 onClick={() => navigate("/history")} className='cursor-pointer hover:text-[#c91616]'>History</h1>
            {/* <h1 className='cursor-pointer'>Profile</h1> */}
            <HoverDropDown />
        </div>
        
    </div>
  )
}

export default NavBar