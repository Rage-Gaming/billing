import React from 'react'
import logo from '../assets/logo.png'

const NavBar = () => {
  return (
    <div className='flex m-4 px-10 py-2 rounded-xl justify-between items-center bg-[#eeeeee] navBar'>
      <div className='flex text-2xl font-bold items-center gap-5'>
        <img src={logo} alt="Logo" className='w-16 h-16' />
        <h1>Boundless</h1>
      </div>
        <div className='flex items-center justify-between gap-10 text-[#242424] font-bold'>
            <h1 className='cursor-pointer'>New Invoice</h1>
            <h1 className='cursor-pointer'>History</h1>
            <h1 className='cursor-pointer'>Profile</h1>
        </div>
        
    </div>
  )
}

export default NavBar