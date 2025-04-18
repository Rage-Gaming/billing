import * as React from 'react';
import logo from '../assets/logo.png';
import Button from '@mui/material/Button';
import NavBar from '../components/NavBar';
import { useCustomer } from '../context/CustomerContext';
import { TextField } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import LineItemComponent from '../components/InvoiceLineItems';
import FormDialog from '../components/Modal';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api';

const initialInvoiceData = {
  client: {
    name: '',
    address: '',
    phone: ''
  },
  invoiceInfo: {
    date: new Date().toISOString().split('T')[0],
    number: ''
  },
  items: [
    {
      description: '',
      qty: '1',
      rate: '',
      amount: '0.00'
    }
  ],
  totals: {
    subTotal: 0,
    gst: 0,
    total: 0
  },
  author: localStorage.getItem('username') || ''
};

const Invoice = () => {
  const { customer } = useCustomer();
  const [isModelOpen, setModelIsOpen] = useState(false);
  const [modalName, setModalName] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemsDatabase, setItemsDatabase] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceData, setInvoiceData] = useState(initialInvoiceData);

  // Memoized calculation of totals
  const calculateTotals = useCallback((items) => {
    const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount)) || 0, 0);
    const gst = subTotal * 0.18;
    return {
      subTotal: parseFloat(subTotal.toFixed(2)),
      gst: parseFloat(gst.toFixed(2)),
      total: parseFloat((subTotal + gst).toFixed(2))
    };
  }, []);

  // Update client info and fetch invoice number when customer changes
  useEffect(() => {
    if (!customer) return;

    const fetchInvoiceNumber = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/invoices/currentInvoiceNo`);
        
        if (response.status === 200) {
          const invoiceNumber = `BND-${response.data.nextNumber}`;
          
          setInvoiceData(prev => ({
            ...prev,
            client: {
              name: customer.clientName,
              address: customer.address,
              phone: customer.number
            },
            invoiceInfo: {
              ...prev.invoiceInfo,
              number: invoiceNumber,
              date: prev.invoiceInfo.date
            }
          }));
        }
      } catch (error) {
        toast.error('Error fetching invoice number!');
        console.error('Invoice number fetch error:', error);
      }
    };

    fetchInvoiceNumber();
  }, [customer]);

  // Calculate totals when items change
  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      totals: calculateTotals(prev.items)
    }));
  }, [invoiceData.items, calculateTotals]);

  // Debounced search for items
  useEffect(() => {
    const fetchItems = async () => {
      if (searchQuery.trim().length < 2) {
        setItemsDatabase([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await axios.post(`${API_BASE_URL}/items/search`, { searchQuery });
        setItemsDatabase(data.success ? data.data : []);
      } catch (error) {
        console.error('Search error:', error);
        setItemsDatabase([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchItems, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleNewItemFormSubmit = async (data) => {
    try {
      const { data: response } = await axios.post(`${API_BASE_URL}/items/create`, {
        itemName: data.name,
        amount: data.amount,
      });

      setItemsDatabase(prev => [
        ...prev,
        {
          id: response.data._id || Math.max(...prev.map(item => item.id), 0) + 1,
          itemName: response.data.itemName,
          amount: response.data.amount,
        }
      ]);

      setInvoiceData(prev => {
        const updatedItems = [...prev.items];
        const currentIndex = updatedItems.length - 1;
        
        updatedItems[currentIndex] = {
          ...updatedItems[currentIndex],
          description: response.data.itemName,
          rate: response.data.amount.toString(),
          amount: (parseFloat(response.data.amount) * parseFloat(updatedItems[currentIndex].qty || 1)).toFixed(2)
        };
        
        return { ...prev, items: updatedItems };
      });

      setModelIsOpen(false);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleItemChange = (index, updatedItem) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? updatedItem : item)
    }));
  };

  const handleAddLine = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', qty: '1', rate: '', amount: '0.00' }]
    }));
  };

  const handleRemoveLine = (index) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCreateNewItem = (description) => {
    setModalName(description);
    setModelIsOpen(true);
  };

  const handleGenerateInvoice = async () => {
    try {
      const { status } = await axios.post(`${API_BASE_URL}/invoices/saveInvoice`, invoiceData);
      if (status === 201) {
        window.print();
        window.location.href = '/customer?invoiceStatus=success';
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Invoice already exists!');
      } else {
        toast.error('Error saving invoice. Please try again.');
      }
    }
  };

  if (!initialInvoiceData.author) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='border-2 border-white rounded-md p-5 text-white'>
          <h1 className='text-3xl font-bold text-[#ce0303]'>Please login to continue</h1>
          <Button variant="contained" onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    )
  };

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

        <div className='text-white mb-20'>
          <h1>Boundless</h1>
          <h1>Pulikken tower</h1>
          <h1>Thrissur, Kerala</h1>
        </div>

        <div className='text-white mb-4 flex justify-between'>
          <div>
            <h1 className='font-bold'>Bill To:</h1>
            <h1>{invoiceData.client.name}</h1>
            <h1>{invoiceData.client.address}</h1>
            <h1>{invoiceData.client.phone}</h1>
          </div>
          <div>
            <div className='flex items-center mb-2'>
              <h1 className='font-bold mr-2'>Invoice Date:</h1>
              <TextField
                type="date"
                value={invoiceData.invoiceInfo.date}
                onChange={(e) => setInvoiceData(prev => ({
                  ...prev,
                  invoiceInfo: {
                    ...prev.invoiceInfo,
                    date: e.target.value
                  }
                }))}
                sx={datePickerStyles}
              />
            </div>
            <div className='flex items-center mb-2'>
              <h1 className='font-bold mr-2'>Invoice Number: {invoiceData.invoiceInfo.number}</h1>
            </div>
          </div>
        </div>

        <div className='border-2 border-white rounded-md p-5 mt-4'>
          <div className='flex bg-gray-600 p-5 text-white font-bold rounded-md mb-4'>
            <div className='w-10 text-center'>#</div>
            <div className='w-[40%] mx-2'>Item description</div>
            <div className='w-[20%] mx-2'>Qty</div>
            <div className='w-[20%] mx-2'>Rate</div>
            <div className='w-[20%] mx-2 flex justify-between'>
              <span className='w-[calc(100%-72px)]'>Amount</span>
              <span className='w-[64px] text-center'>Actions</span>
            </div>
          </div>
          
          {invoiceData.items.map((item, index) => (
            <LineItemComponent
              key={index}
              index={index}
              item={item}
              itemsList={itemsDatabase}
              onItemChange={handleItemChange}
              onAddLine={handleAddLine}
              onInputChange={(e) => setSearchQuery(e.target.value)}
              onRemoveLine={handleRemoveLine}
              onCreateNewItem={handleCreateNewItem}
              isLast={index === invoiceData.items.length - 1}
              autoFocus={index === invoiceData.items.length - 1 && invoiceData.items.length > 1}
              loading={loading}
            />
          ))}

          <div className='flex justify-end items-center mt-8 text-white'>
            <div className='flex flex-col items-end'>
              <div className='text-xl font-bold mb-4'>Sub Total: ${invoiceData.totals.subTotal}</div>
              <div className='text-xl font-bold mb-4'>Tax (18%): ${invoiceData.totals.gst}</div>
              <div className='text-xl font-bold'>Total: ${invoiceData.totals.total}</div>
            </div>
          </div>

          <div className='mt-8 flex justify-end'>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleGenerateInvoice}
            >
              Generate Invoice
            </Button>
          </div>
        </div>
        
        <FormDialog
          open={isModelOpen}
          onClose={() => setModelIsOpen(false)}
          title="Create new item"
          description="Please enter the details"
          fields={[
            {
              name: 'name',
              label: 'Item Name',
              type: 'text',
              required: true,
              defaultValue: modalName.charAt(0).toUpperCase() + modalName.slice(1)
            },
            {
              name: 'amount',
              label: 'Rate',
              type: 'number',
              required: true,
              inputProps: { 
                maxLength: 10,
                step: "0.01",
                min: "0"
              }
            }
          ]}
          onSubmit={handleNewItemFormSubmit}
          submitText="Save"
        />
      </div>
    </div>
  );
};

const datePickerStyles = {
  '& .MuiInputBase-input': {
    color: 'white',
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
  '& input[type="date"]::-webkit-calendar-picker-indicator': {
    filter: 'invert(1)',
    cursor: 'pointer',
    opacity: 1,
    '&:hover': {
      opacity: 0.8
    }
  }
};

export default Invoice;