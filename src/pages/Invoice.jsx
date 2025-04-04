import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import logo from '../assets/logo.png';
import NavBar from '../components/NavBar';
import InvoiceLineItems from '../components/InvoiceLineItems';

const Invoice = () => {
  const [invoiceDate, setInvoiceDate] = useState(new Date());

  // Custom input component for bordered date picker
  const BorderedDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <button
      className="printDesignDate cursor-pointer px-3 py-1 border-2 border-gray-300 rounded-md text-white hover:bg-gray-700 transition-colors"
      onClick={onClick}
      ref={ref}
    >
      {value}
    </button>
  ));

  return (
    <div className='p-4'>
      <NavBar />
      <div className='mt-4 p-10 rounded-xl bg-[#a5a5a525] border-1 border-[#d4d4d4] invoice'>
        <div className='items-center text-white printDesign'>
          <div className='flex justify-between items-center'>
            <img src={logo} alt="Logo" className='w-16 h-16' />
            <h1 className='text-2xl font-bold'>INVOICE</h1>
          </div>
          <div className='flex flex-col mt-10'>
            <h1>Boundless</h1>
            <h1>Pulikken tower</h1>
            <h1>Thrissur, Kerala</h1>
          </div>
          <div className='flex mt-10 justify-between '>
            <div className='flex flex-col mt-10'>
              <h1 className='font-bold'>Bill To:</h1>
              <h1>Client name : </h1>
              <h1>Client address : </h1>
              <h1>City : </h1>
            </div>
            <div className='flex flex-col mt-10'>
              <h1 className='font-bold'>Invoice No:</h1>
              <div className='flex items-center gap-2'>
                <h1>Invoice date:</h1>
                <DatePicker
                  selected={invoiceDate}
                  onChange={(date) => setInvoiceDate(date)}
                  dateFormat="dd-MMM-yyyy"
                  customInput={<BorderedDateInput />}
                  popperPlacement="bottom-start"
                />
              </div>
            </div>
          </div>

          <div className='flex mt-10 justify-between'>
            <InvoiceLineItems />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoice;