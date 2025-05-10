import LineItemComponent from '../components/InvoiceLineItems';
import { useCustomer } from '../context/CustomerContext';
import { useState, useEffect, useCallback } from 'react';
import FormDialog from '../components/Modal';
import Button from '@mui/material/Button';
import NavBar from '../components/NavBar';
import { TextField } from '@mui/material';
import logo from '../assets/logo.png';
import { toast } from 'sonner';
import { useInvoiceHistory } from '../context/InvoiceHistoryContext';
import * as React from 'react';
import axios from 'axios';
import { useParams, useSearchParams } from 'react-router-dom';


const Invoice = () => {
  const initialInvoiceData = {
    client: {
      name: '',
      address: '',
      phone: ''
    },
    invoiceInfo: {
      date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
      number: ''
    },
    items: [
      {
        description: '',
        qty: '1',
        rate: '',
        amount: '0.00',
      }
    ],
    totals: {
      subTotal: 0,
      offer: 0,
      total: 0
    },
    author: localStorage.getItem('username')
  };

  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { customer, setCustomer } = useCustomer();
  const [isModelOpen, setModelIsOpen] = useState(false);
  const [modalName, setModalName] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemsDatabase, setItemsDatabase] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [offInput, setOffInput] = useState('0');
  const [off, setOff] = useState(parseFloat(offInput) || 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
  const [isEditMode, setIsEditMode] = useState(false);
  const { invoiceHistory } = useInvoiceHistory();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const isHistory = invoiceHistory && searchParams.get('new') === 'false' ? true : false;


  // Memoized calculation of totals
  const calculateTotals = useCallback((items) => {
    const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const offer = parseFloat(offInput) || 0;
    return {
      subTotal: parseFloat(subTotal.toFixed(2)),
      offer: parseFloat(offer.toFixed(2)),
      total: parseFloat((subTotal - offer).toFixed(2))
    };
  }, [offInput]);

  // Load invoice data if it's a historical invoice
  useEffect(() => {
    if (isHistory) {
      setInvoiceData({
        client: {
          name: invoiceHistory[0].client.name,
          address: invoiceHistory[0].client.address,
          phone: invoiceHistory[0].client.phone
        },
        invoiceInfo: {
          date: new Date(invoiceHistory[0].invoiceInfo.date).toISOString().split('T')[0],
          number: invoiceHistory[0].invoiceInfo.number
        },
        items: invoiceHistory[0].items.map(item => ({
          description: item.description,
          qty: item.quantity.toString(),
          rate: item.rate.toString(),
          amount: item.amount.toString(),
        })),
        totals: {
          subTotal: invoiceHistory[0].totals.subTotal,
          offer: invoiceHistory[0].totals.offer,
          total: invoiceHistory[0].totals.total
        },
        author: invoiceHistory[0].author
      });

      if (isAdmin) {
        setIsEditMode(false);
      }
    }
  }, [isHistory, invoiceHistory, isAdmin]);

  // Update client info and fetch invoice number when customer changes (for new invoices)
  useEffect(() => {
    if (!customer || isHistory) return;

    const fetchInvoiceNumber = async () => {
      try {
        const response = await axios.post(`/api/invoices/currentInvoiceNo`);

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
  }, [customer, isHistory]);

  // Calculate totals when items change (only in edit mode or new invoice)
  useEffect(() => {
    if (isEditMode || !isHistory) {
      setInvoiceData(prev => ({
        ...prev,
        totals: calculateTotals(prev.items)
      }));
    }
  }, [invoiceData.items, calculateTotals, isEditMode, isHistory]);

  // Debounced search for items
  useEffect(() => {
    const fetchItems = async () => {
      if (searchQuery.trim().length < 2) {
        setItemsDatabase([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await axios.post(`/api/items/search`, { searchQuery });
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
      const { data: response } = await axios.post(`/api/items/create`, {
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
          amount: (parseFloat(response.data.amount) * parseFloat(updatedItems[currentIndex].qty || 1)).toFixed(2),
        };

        return { ...prev, items: updatedItems };
      });

      setModelIsOpen(false);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleItemChange = (index, updatedItem) => {
    if (!isEditMode && isHistory) return;

    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? updatedItem : item)
    }));
  };

  const handleAddLine = () => {
    if (!isEditMode && isHistory) return;
    if (invoiceData.items[invoiceData.items.length - 1].description === '') return toast.error('Please fill in the last item before adding a new one!');

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        qty: '1',
        rate: '',
        amount: '0.00',
      }]
    }));
  };

  const handleRemoveLine = (index) => {
    if (!isEditMode && isHistory) return;
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCreateNewItem = (description) => {
    if (!isEditMode && isHistory) return;
    setModalName(description);
    setModelIsOpen(true);
  };

  const handleGenerateInvoice = async () => {
    if (!invoiceData.invoiceInfo.number) {
      toast.error('Please enter a valid invoice number!');
      return;
    }
    if (invoiceData.items.some(item => !item.description || !item.rate || !item.qty)) {
      toast.error('Please fill in all item details!');
      return;
    }
    try {
      const payload = {
        invoiceNumber: invoiceData.invoiceInfo.number,  // Include invoice number in the payload
        clientName: invoiceData.client.name,
        clientAddress: invoiceData.client.address,
        clientPhone: invoiceData.client.phone,
        date: invoiceData.invoiceInfo.date,
        items: invoiceData.items.map(item => ({
          description: item.description,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
        })),
        author: invoiceData.author,
        totals: invoiceData.totals
      };
    
      if (isHistory) {
        // Update existing invoice with invoiceNumber in the body
        const { status } = await axios.post(`/api/invoices/update`, payload); // Send the data to backend
        if (status === 200) {
          toast.success('Invoice updated successfully!');
          setIsEditMode(false);
        }
      } else {
        // Create a new invoice if it's not a history record
        const { status } = await axios.post(`/api/invoices/saveInvoice`, payload);
        if (status === 201) {
          window.print();
          window.location.href = '/customer?invoiceStatus=success';
        }
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Invoice already exists!');
      } else {
        toast.error(error.response?.data?.message || 'Error saving invoice. Please try again.');
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

  if (!customer && !isHistory) {
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
          <h1 className='text-3xl font-bold text-center text-white printText'>Invoice</h1>
          {isHistory && isAdmin && (
            <Button
            className='printDisable'
              variant="contained"
              onClick={() => setIsEditMode(!isEditMode)}
              color={isEditMode ? 'secondary' : 'primary'}
            >
              {isEditMode ? 'Cancel Edit' : 'Edit Invoice'}
            </Button>
          )}
        </div>

        <div className='text-white mb-20 printText'>
          <h1>Boundless</h1>
          <h1>Pulikken tower</h1>
          <h1>Thrissur, Kerala</h1>
        </div>

        <div className='text-white mb-4 flex justify-between printText'>
          <div>
            <h1 className='font-bold'>Bill To:</h1>
            <h1>{invoiceData.client.name}</h1>
            <h1>{invoiceData.client.address}</h1>
            <h1>{invoiceData.client.phone}</h1>
            {!isHistory && (
              <h1 onClick={() => setCustomer(null)} className='underline cursor-pointer text-blue-500 printDisable'>
                Change user
              </h1>
            )}
          </div>
          <div>
            <div className='flex items-center mb-2 printText'>
              <h1 className='font-bold mr-2'>Invoice Date:</h1>
              {isEditMode || !isHistory ? (
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
                  disabled={!isEditMode && isHistory}
                  sx={{
                    // UI Styles
                    '& .MuiInputBase-input': {
                      color: 'white',
                      '&::-webkit-calendar-picker-indicator': {
                        filter: 'invert(1)' // Makes native picker icon white
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white'
                    },
                    '& .MuiIconButton-root': {
                      color: 'white' // White calendar icon in UI
                    },

                    // Print Styles
                    '@media print': {
                      '& .MuiInputBase-input': {
                        color: 'black !important',
                        '&::-webkit-calendar-picker-indicator': {
                          display: 'none !important'
                        }
                      },
                      '& .MuiIconButton-root': {
                        display: 'none !important' // Hide only in print
                      }
                    }
                  }}
                  InputProps={{
                    className: 'hide-calendar-on-print' // For additional print control
                  }}
                />
              ) : (
                <span className='printText'>{new Date(invoiceData.invoiceInfo.date).toLocaleDateString()}</span>
              )}
            </div>
            <div className='flex items-center mb-2 printText'>
              <h1 className='font-bold mr-2'>Invoice Number: {invoiceData.invoiceInfo.number}</h1>
            </div>
          </div>
        </div>

        <div className='border-2 border-white rounded-md p-5 mt-4 printText printBorder'>
          <div className='flex bg-gray-600 p-5 text-white font-bold rounded-md mb-4 printText'>
            <div className='w-10 text-center'>#</div>
            <div className='w-[50%] mx-2'>Item description</div>
            <div className='w-[15%] mx-2'>Qty</div>
            <div className='w-[15%] mx-2'>Rate</div>
            <div className='w-[15%] mx-2 flex justify-between'>
              <span className='w-[calc(100%-72px)]'>Amount</span>
              {/* {(isEditMode || !isHistory) && <span className='w-[64px] text-center printDisable'>Actions</span>} */}
            </div>
          </div>

          {invoiceData.items.map((item, index) => (
            <LineItemComponent
              className='printText'
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
              readOnly={!isEditMode && isHistory}
            />
          ))}

          {(isEditMode || !isHistory) && (
            <div className='mt-4 printDisable'>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleAddLine}
                disabled={!isEditMode && isHistory}
              >
                Add Line Item
              </Button>
            </div>
          )}

          <hr className='PrintUnderLine'/>
          <div className='flex justify-end items-center mt-8 text-white printText'>
            <div className='flex flex-col items-end w-[20%] justify-end printTotal'>
              <div className='text-xl font-bold mb-4'>Sub Total: ₹{invoiceData.totals.subTotal.toFixed(2)}</div>
              <div className='text-xl font-bold mb-4 justify-end items-center flex'>
                Discount: ₹
                <input
                  className="text-white border ml-2 rounded-xs px-2 py-1 printBorderDisable printText"
                  type="number"
                  value={inputFocused && offInput === '0' ? '' : offInput}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => {
                    setInputFocused(false);
                    if (offInput === '' || isNaN(parseFloat(offInput))) {
                      setOffInput('0');
                    }
                  }}
                  onChange={(e) => {
                    setOffInput(e.target.value);
                  }}
                  style={{
                    width: `${Math.max(offInput.length + 2, 4)}ch`,
                    minWidth: '40px',
                  }}
                  disabled={!isEditMode && isHistory}
                />
              </div>
              <div className='text-xl font-bold'>Total: ₹{invoiceData.totals.total.toFixed(2)}</div>
            </div>
          </div>

          <div className='mt-8 flex justify-end printDisable'>
            {(isEditMode || !isHistory) ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateInvoice}
              >
                {isHistory ? 'Update Invoice' : 'Generate Invoice'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.print()}
              >
                Print Invoice
              </Button>
            )}
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
            },
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