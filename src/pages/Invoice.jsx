import * as React from 'react';
import logo from '../assets/logo.png';
import Button from '@mui/material/Button';
import NavBar from '../components/NavBar';
import { useCustomer } from '../context/CustomerContext';
import { TextField } from '@mui/material';
import { useState } from 'react';
import LineItemComponent from '../components/InvoiceLineItems';
import FormDialog from '../components/Modal';
import axios from 'axios';
import { useEffect } from 'react';

const Invoice = () => {
  const { customer } = useCustomer();
  const [isModelOpen, setModelIsOpen] = useState(false);
  const [modalName, setModalName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [lineItems, setLineItems] = useState([
    { description: '', qty: '1', rate: '', amount: '0.00' }
  ]);
  const [itemsDatabase, setItemsDatabase] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const formFields = [
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
  ];

  useEffect(() => {
    const fetchItems = async () => {
      if (searchQuery.trim().length < 2) {
        setItemsDatabase([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.post('http://localhost:5000/api/items/search', { searchQuery });
        if (response.data.success) {
          setItemsDatabase(response.data.data);
        } else {
          setItemsDatabase([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setItemsDatabase([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleNewItemFormSubmit = async (data) => {
    const newItem = {
      itemName: data.name,
      amount: data.amount,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/items/create', newItem);
      if (response.status === 201) {
        const createdItem = response.data.data;
        
        setItemsDatabase(prevItems => [
          ...prevItems,
          {
            id: createdItem._id || Math.max(...prevItems.map(item => item.id), 0) + 1,
            itemName: createdItem.itemName,
            amount: createdItem.amount,
          }
        ]);

        setLineItems(prevItems => {
          const updatedItems = [...prevItems];
          const currentIndex = updatedItems.length - 1;
          updatedItems[currentIndex] = {
            ...updatedItems[currentIndex],
            description: createdItem.itemName,
            rate: createdItem.amount.toString(),
            qty: updatedItems[currentIndex].qty || '1',
            amount: (parseFloat(createdItem.amount) * parseFloat(updatedItems[currentIndex].qty || 1)).toFixed(2)
          };
          return updatedItems;
        });

        setModelIsOpen(false);
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleItemChange = (index, updatedItem) => {
    const newItems = [...lineItems];
    newItems[index] = updatedItem;
    setLineItems(newItems);
  };  

  const handleAddLine = () => {
    setLineItems([...lineItems, { description: '', qty: '1', rate: '', amount: '0.00' }]);
  };

  const handleRemoveLine = (index) => {
    if (lineItems.length > 1) {
      const newItems = lineItems.filter((_, i) => i !== index);
      setLineItems(newItems);
    }
  };

  const handleCreateNewItem = (description) => {
    setModalName(description);
    setModelIsOpen(true);
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0).toFixed(2);
  };

  const calculateGst = () => {
    const total = parseFloat(calculateTotal()) || 0;
    return (total * 0.18).toFixed(2);
  };

  const totalWithGst = () => {
    const total = parseFloat(calculateTotal()) + parseFloat(calculateGst()) || 0;
    return total.toFixed(2);
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
            <h1>{customer.clientName}</h1>
            <h1>{customer.address}</h1>
            <h1>{customer.number}</h1>
          </div>
          <div className='flex items-center justify-center'>
            <h1 className='font-bold mr-2'>Invoice Date:</h1>
            <TextField
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
              }}
            />
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
          
          {lineItems.map((item, index) => (
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
              isLast={index === lineItems.length - 1}
              autoFocus={index === lineItems.length - 1 && lineItems.length > 1}
            />
          ))}

          <div className='flex justify-end items-center mt-8 text-white'>
            <div className='flex flex-col items-end'>
              <div className='text-xl font-bold mb-4'>Sub Total: ${calculateTotal()}</div>
              <div className='text-xl font-bold mb-4'>Tax (18%): ${calculateGst()}</div>
              <div className='text-xl font-bold'>Total: ${totalWithGst()}</div>
            </div>
          </div>

          <div className='mt-8 flex justify-end'>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => console.log('Submitting invoice:', { customer, date: invoiceDate, lineItems, subTotal: calculateTotal(), gst: calculateGst(), total: totalWithGst() })}
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
          fields={formFields}
          onSubmit={handleNewItemFormSubmit}
          submitText="Save"
        />
      </div>
    </div>
  );
};

export default Invoice;