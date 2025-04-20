import { useNavigate } from "react-router-dom";
import NavBar from '../components/NavBar';
import { useInvoiceHistory } from '../context/InvoiceHistoryContext';
import logo from '../assets/logo.png';
import React from 'react'

const ItemsInvoiceHistory = () => {
    const navigate = useNavigate();
    const { invoiceHistory } = useInvoiceHistory();
    console.log(invoiceHistory)

    return (
        <>
            {invoiceHistory != null ? (
                <section>
                    <div className='mb-5'>
                        <NavBar />
                    </div>
                    
                    <div className='mx-5 p-5 border-2 border-white rounded-md'>
                            <div className='flex justify-between items-center mb-4'>
                              <img src={logo} alt="logo" width={60} height={60} />
                              <h1 className='text-3xl font-bold text-center text-white'>Invoice</h1>
                            </div>
                    
                            <div className='text-white mb-20'>
                              <h1>Boundless</h1>
                              <h1>Pulikken tower</h1>
                              <h1>Thrissur, Kerala</h1>
                            </div>
                    
                            <div className='text-white mb-4 flex justify-between'>
                              <div>
                                <h1 className='font-bold'>Bill To:</h1>
                                <h1>{invoiceHistory[0].client.name}</h1>
                                <h1>{invoiceHistory[0].client.address}</h1>
                                <h1>{invoiceHistory[0].client.phone}</h1>
                              </div>
                              <div>
                                <div className='flex items-center mb-2'>
                                <h1 className='font-bold mr-2'>Invoice Date: {invoiceHistory[0].invoiceInfo.date.split('T')[0]}</h1>
                                </div>
                                <div className='flex items-center mb-2'>
                                  <h1 className='font-bold mr-2'>Invoice Number: {invoiceHistory[0].invoiceInfo.number}</h1>
                                </div>
                              </div>
                            </div>
                          </div>

                </section>
            ) : (

                // If invoiceHistory is null, show an error message
                <section>
                    <div className='m-5'>
                        <NavBar />
                    </div>
                    <div className='flex flex-col items-center justify-center h-screen bg-[#464545]'>
                        <h1 className='text-white text-3xl font-bold'>Oops! Something went wrong</h1>
                        <p className='text-white'>Page didn't get the required data. Please try again later</p>
                        <button onClick={() => navigate('/history')} className='cursor-pointer text-white mt-5 border p-2 rounded-xl'>Click here for history</button>
                    </div>
                </section>
            )}
        </>

    )
}

export default ItemsInvoiceHistory