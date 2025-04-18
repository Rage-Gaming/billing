import { React, useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your actual API base URL

const initialInvoiceData = [
    {
        client: {
            name: 'Rage',
            address: 'test',
            phone: '123456789'
        },
        invoiceInfo: {
            date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
            number: '001'
        },
    },
    {
        client: {
            name: 'Ramu',
            address: 'nice',
            phone: '8547318940'
        },
        invoiceInfo: {
            date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
            number: '002'
        },
    },
    // Add more invoices if needed
];

const InvoiceHistory = () => {
    const [query, setQuery] = useState('')

    

    const handleViewButton = (invoiceNumber) => () => {
        // Handle the view button click here, e.g., navigate to the invoice details page
        console.log(`View invoice number: ${invoiceNumber}`);
        // You can use a router or any other method to navigate to the invoice details page
    }

    useEffect(() => {
        
    }, [query])

    return (
        <section>
            <div className='m-5'>
                <NavBar />
            </div>

            <div className='rounded-lg border-[#8d8d8d] mx-20 h-auto bg-[#464545]'>
                <div className='text-white bg-[#494949] w-full p-6'>
                    <h1 className='text-center text-3xl font-bold'>Invoice History</h1>
                    <p className='text-center text-lg'>Here you can view your past invoices.</p>
                </div>

                <div className='p-3 bg-[#5e5e5e] text-white'>
                    <input onChange={(e) => setQuery(e.target.value)} placeholder='Search...' type="text" className='border-1 rounded-xl p-2 outline-none w-88' />
                </div>

                <div className='p-6 bg-[#8d8d8d] text-white'>
                    <div className='flex items-center mb-4 bg-[#494949] p-5 w-full h-auto'>
                        <h2 className='w-125 text-xl font-bold'>Invoice No #</h2>
                        <h2 className='w-125 text-xl font-bold'>Invocie Date</h2>
                        <h2 className='w-125 text-xl font-bold'>Client Name</h2>
                        <h2 className='w-125 text-xl font-bold'>Client Address</h2>
                        <h2 className='w-125 text-xl font-bold'>Client Phone</h2>
                        <h2 className='w-125 text-xl font-bold'>Action</h2>

                    </div>
                    {initialInvoiceData
                        .filter((invoice) =>
                            invoice.client.name.toLowerCase().includes(query.toLowerCase()) ||
                            invoice.client.address.toLowerCase().includes(query.toLowerCase()) ||
                            invoice.client.phone.toLowerCase().includes(query.toLowerCase()) ||
                            invoice.invoiceInfo.number.toLowerCase().includes(query.toLowerCase())
                        )
                        .map((invoice, index) => (
                            <div key={index} className='flex bg-[#494949] p-4 rounded-lg mb-8 overflow-x-auto'>
                                <h2 className='text-xl font-bold w-125'>#{invoice.invoiceInfo.number}</h2>
                                <p className='w-125'>{invoice.invoiceInfo.date}</p>
                                <p className='w-125'>{invoice.client.name}</p>
                                <p className='w-125'>{invoice.client.address}</p>
                                <p className='w-125'>{invoice.client.phone}</p>
                                <div className='w-125 flex justify-start items-center'>
                                    <button onClick={handleViewButton(invoice.invoiceInfo.number)} className='cursor-pointer border px-2 rounded-md'>View</button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

        </section>
    )
}

export default InvoiceHistory