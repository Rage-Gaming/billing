import React from 'react'
import logo from '../assets/logo.png'
import InvoiceLineItems from './InvoiceLineItems'

const Invoice = () => {
  return (
    <div className=' m-4 p-10 rounded-xl bg-[#a5a5a525] border-1 border-[#d4d4d4] invoice'>
        <div className=' items-center text-white'>
            <div className='flex justify-between items-center'>
                <img src={logo} alt="Logo" className='w-16 h-16' />
                <h1 className='text-2xl font-bold'>INVOICE</h1>
            </div>
            <div className='flex flex-col mt-10'>
                <h1>Boundless</h1>
                <h1>Pulikken tower</h1>
                <h1>Opp. Poonkunnam St. Joseph's church</h1>
                <h1>Thrissur, Kerala</h1>
            </div>
            <div className='flex mt-10 justify-between'>
                <div className='flex flex-col mt-10'>
                    <h1 className='font-bold'>Bill To:</h1>
                    <h1>Client name : </h1>
                    <h1>Client address : </h1>
                    <h1>City : </h1>
                </div>
                <div className='flex flex-col mt-10'>
                    <h1 className='font-bold'>Invoice No:</h1>
                    <h1>Invoice date:</h1>
                    <h1>Due date:</h1>
                </div>
            </div>

            <div className='flex mt-10 justify-between'>
                <InvoiceLineItems />
            </div>
        </div>
        
    </div>
  )
}

export default Invoice