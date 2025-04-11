import * as React from 'react';
import logo from '../assets/logo.png';
import Button from '@mui/material/Button';
import NavBar from '../components/NavBar';
import { useCustomer } from '../context/CustomerContext';
import { TextField } from '@mui/material';
import { useState } from 'react';

const Invoice = () => {
  const { customer } = useCustomer();
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  console.log(invoiceDate);

  if (!customer) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='border-2 border-white rounded-md p-5 text-white'>
          <div className='flex flex-col justify-center items-center'>
            <h1 className='text-3xl font-bold text-[#ce0303]'>No customer selected?</h1>
            <h1 className='text-base text-white opacity-70 mb-10 mt-3'>
              Please select by clicking <span className='font-bold'>"Select Customer"</span> button
            </h1>
            <Button variant="contained" onClick={() => window.location.href = '/customer'}>
              Select Customer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='m-5'>
        <NavBar />
      </div>
      <div className='mx-5 p-5 border-2 border-white rounded-md'>
        <div className='flex justify-between items-center mb-4'>
          <img src={logo} alt="logo" width={60} height={60} />
          <h1 className='text-3xl font-bold text-center text-white'>Invoice</h1>
        </div>

        <div className='text-white mb-4'>
          <h1>Boundless</h1>
          <h1>Pulikken tower</h1>
          <h1>Thrissur, Kerala</h1>
        </div>

        <div className='text-white mb-4 flex justify-between'>
          <div>
            <h1 className='font-bold'>Bill To:</h1>
            <h1>{customer.label}</h1>
            <h1>{customer.address}</h1>
            <h1>{customer.number}</h1>
          </div>
          <div className='flex items-center justify-center'>
            <h1 className='font-bold'>Invoice Date:</h1>
            <TextField
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white',
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                  '&.Mui-focused': {
                    color: 'white'
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '& .MuiOutlinedInput-root': {
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                },
                // Specific styling for the calendar icon
                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)', // This makes the icon white
                  cursor: 'pointer',
                  opacity: 1,
                  '&:hover': {
                    opacity: 0.8
                  }
                }
              }}
            />
          </div>
        </div>

        <div className='border-2 border-white rounded-md p-5 mt-4'>
          {/* Invoice items will go here */}
        </div>
      </div>
    </div>
  );
};

export default Invoice;