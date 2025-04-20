import { React, useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import { useInvoiceHistory } from '../context/InvoiceHistoryContext';
import { useCustomer } from '../context/CustomerContext';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const InvoiceHistory = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('')
    const [itemsDatabase, setItemsDatabase] = useState([]);
    const { setInvoiceHistory } = useInvoiceHistory();
    const { setCustomer } = useCustomer();



    const handleViewButton = (invoiceNumber) => async () => {
        const { data } = await axios.post(`http://localhost:5000/api/invoices/getInvoice?invoiceId=${invoiceNumber}`)
        setInvoiceHistory(data.data);
        setCustomer(null);
        navigate('/invoice', { state: { invoice: data } });
    }

    useEffect(() => {
        const fetchItems = async () => {
            if (query.trim().length < 2) {
                setItemsDatabase([]);
                return;
            }

            // setLoading(true);
            try {
                const { data } = await axios.post(`http://localhost:5000/api/invoices/search`, { query });
                // console.log(data)
                setItemsDatabase(data.success ? data.data : []);
            } catch (error) {
                console.error('Search error:', error);
                setItemsDatabase([]);
            } finally {
                // setLoading(false);
            }
        };

        const delayDebounce = setTimeout(fetchItems, 300);
        return () => clearTimeout(delayDebounce);
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


                    {query.length < 2 ? (
                        <div className='text-center text-lg'>Please enter at least 2 characters to search</div>
                    ): itemsDatabase.length === 0 ? ( 
                        <div className='text-center text-lg'>No results found</div>
                    ) : itemsDatabase
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