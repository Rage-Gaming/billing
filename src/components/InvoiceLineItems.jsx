import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

function InvoiceLineItems() {
  // State for items database
  const [items, setItems] = useState([
    { id: 1, description: '', qty: 1, rate: 0.00, amount: 0.00 }
  ]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', rate: '0.00' }); // Initialize rate as string
  const [currentCreatingItemId, setCurrentCreatingItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Debounced server-side search
  const searchItems = useCallback(debounce(async (query) => {
    if (!query || query.length < 2) {
      setFilteredItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/items/search?q=${encodeURIComponent(query)}`);
      setFilteredItems(response.data);
    } catch (error) {
      console.error('Error searching items:', error);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  }, 300), []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      searchItems.cancel();
    };
  }, [searchItems]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (isNaN(item.amount) ? 0 : item.amount), 0);
  const taxRate = 0.18;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) && 
          !event.target.closest('.dropdown-input')) {
        setActiveInput(null);
      }
      
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowCreateModal(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNextId = () => {
    if (items.length === 0) return 1;
    const maxId = Math.max(...items.map(item => item.id));
    return maxId + 1;
  };

  const addNewItem = () => {
    const lastItem = items[items.length - 1];
    
    if (lastItem && !lastItem.description.trim()) {
      showNotification('Please fill the current item description before adding a new one');
      return;
    }
  
    setItems([...items, { 
      id: getNextId(), 
      description: '', 
      qty: 1, 
      rate: 0.00, 
      amount: 0.00 
    }]);
  };

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const previewInvoice = async () => {
    let itemsToPrint = [...items];
    
    if (itemsToPrint.length > 0 && !itemsToPrint[itemsToPrint.length-1].description) {
      itemsToPrint = itemsToPrint.slice(0, -1);
    }
  
    const hasValidItems = itemsToPrint.some(item => item.description.trim() !== '');
  
    if (!hasValidItems) {
      showNotification("Invoice must contain at least one item with description");
      return;
    }
  
    if (itemsToPrint.length !== items.length) {
      setItems(itemsToPrint);
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/invoices', {
        items: itemsToPrint,
        subtotal,
        taxAmount,
        total
      });
      console.log('Invoice saved:', response.data);
      
      setTimeout(() => {
        window.print();
      }, 100);
    } catch (error) {
      console.error('Error saving invoice:', error);
      showNotification('Failed to save invoice');
    }
  };

  const deleteItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      showNotification('Invoice must contain at least one item');
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updatedItem.amount = updatedItem.qty * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleDescriptionChange = (id, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, description: value };
      }
      return item;
    }));
    
    setActiveInput(id);
    searchItems(value);
  };

  const selectItem = (itemId, selectedItem) => {
    const existingItemIndex = items.findIndex(item => 
      item.description === selectedItem.name && item.id !== itemId
    );

    if (existingItemIndex >= 0) {
      setItems(prevItems => {
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          qty: newItems[existingItemIndex].qty + 1,
          amount: (newItems[existingItemIndex].qty + 1) * newItems[existingItemIndex].rate
        };
        if (existingItemIndex !== prevItems.findIndex(item => item.id === itemId)) {
          return newItems.filter(item => item.id !== itemId);
        }
        return newItems;
      });
    } else {
      setItems(prevItems => {
        const updatedItems = prevItems.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              description: selectedItem.name,
              rate: selectedItem.rate,
              amount: item.qty * selectedItem.rate
            };
          }
          return item;
        });
        if (itemId === prevItems[prevItems.length - 1].id) {
          return [...updatedItems, { 
            id: getNextId(), 
            description: '', 
            qty: 1, 
            rate: 0.00, 
            amount: 0.00 
          }];
        }
        return updatedItems;
      });
    }
    setActiveInput(null);
    setFilteredItems([]);
  };

  const handleCreateNewItem = (itemId) => {
    setCurrentCreatingItemId(itemId);
    setNewItem({ 
      name: items.find(item => item.id === itemId).description, 
      rate: '0.00' // Initialize with string '0.00'
    });
    setShowCreateModal(true);
  };

  const saveNewItem = async () => {
    try {
      const rateValue = parseFloat(newItem.rate) || 0;
      
      if (!newItem.name.trim() || isNaN(rateValue)) {
        showNotification('Please enter valid item details');
        return;
      }
  
      const response = await axios.post('http://localhost:5000/api/save/items', {
        name: newItem.name,
        rate: rateValue
      });
  
      // Ensure we have a valid response
      if (!response.data) {
        throw new Error('Invalid server response');
      }
  
      setItems(prevItems => {
        // Safely map through items
        const updatedItems = (prevItems || []).map(item => {
          if (item.id === currentCreatingItemId) {
            return {
              ...item,
              description: response.data.name || newItem.name,
              rate: response.data.rate || rateValue,
              amount: (item.qty || 1) * (response.data.rate || rateValue)
            };
          }
          return item;
        });
  
        // Add new empty item if needed
        if (currentCreatingItemId === (prevItems[prevItems.length - 1]?.id)) {
          return [
            ...updatedItems, 
            { 
              id: getNextId(), 
              description: '', 
              qty: 1, 
              rate: 0.00, 
              amount: 0.00 
            }
          ];
        }
        return updatedItems;
      });
  
      setShowCreateModal(false);
      setNewItem({ name: '', rate: '0.00' });
    } catch (error) {
      console.error('Error saving new item:', error);
      showNotification('Failed to save new item');
    }
  };

  return (
    <div className="w-full p-6 text-gray-100 rounded-lg shadow-xl border-2">
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Create New Item</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Item Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newItem.rate}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid numbers
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setNewItem({...newItem, rate: value});
                  }
                }}
                onBlur={(e) => {
                  // Format to 2 decimal places when leaving field
                  if (e.target.value !== '') {
                    const num = parseFloat(e.target.value);
                    setNewItem({...newItem, rate: isNaN(num) ? '0.00' : num.toFixed(2)});
                  }
                }}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={saveNewItem}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                disabled={!newItem.name || !newItem.rate}
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-700 bg-gray-700">
            <th className="text-left py-3 px-4 font-semibold">#</th>
            <th className="text-left py-3 px-4 font-semibold">Item Description</th>
            <th className="text-right py-3 px-4 font-semibold">Qty</th>
            <th className="text-right py-3 px-4 font-semibold">Rate</th>
            <th className="text-right py-3 px-4 font-semibold">Amount</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800">
              <td className="py-3 px-4">{index + 1}</td>
              <td className="py-3 px-4 relative">
                <div ref={dropdownRef}>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.description}
                    onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                    onFocus={() => {
                      setActiveInput(item.id);
                      handleDescriptionChange(item.id, item.description);
                    }}
                    placeholder="Search items..."
                  />
                  
                  {activeInput === item.id && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                      {isLoading ? (
                        <div className="p-3 text-center text-gray-400">Searching...</div>
                      ) : filteredItems.length > 0 ? (
                        <ul>
                          {filteredItems.map((dbItem) => (
                            <li
                              key={dbItem.id}
                              className="p-3 border-b border-gray-600 hover:bg-gray-600 cursor-pointer flex justify-between items-center"
                              onClick={() => selectItem(item.id, dbItem)}
                            >
                              <span className="font-medium">{dbItem.name}</span>
                              <span className="text-sm text-gray-300">${dbItem.rate.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : item.description.length >= 2 && !isLoading ? (
                        <div 
                          className="p-3 border-b border-gray-600 hover:bg-gray-600 cursor-pointer text-blue-400 font-medium"
                          onClick={() => handleCreateNewItem(item.id)}
                        >
                          + Create "{item.description}"
                        </div>
                      ) : item.description.length > 0 ? (
                        <div className="p-3 text-center text-gray-400">
                          {item.description.length < 2 ? 'Type at least 2 characters' : 'No items found'}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <input
                  type="number"
                  className="w-20 p-2 border border-gray-600 rounded bg-gray-700 text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.qty}
                  onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value || 0))}
                  min="1"
                />
              </td>
              <td className="py-3 px-4 text-right">
                <input
                  type="number"
                  className="w-24 p-2 border border-gray-600 rounded bg-gray-700 text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.rate}
                  onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value || 0))}
                  step="0.01"
                />
              </td>
              <td className="py-3 px-4 text-right">
                <div className="w-24 p-2 border border-gray-600 rounded bg-gray-700 text-right">
                  ${!isNaN(item.amount) ? item.amount.toFixed(2) : '0.00'}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 text-red-400 hover:text-red-300 focus:outline-none"
                  title="Delete item"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6">
        <div className="flex justify-end items-center">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="font-semibold">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="font-semibold">Tax (18%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-lg">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={addNewItem}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Line Item
        </button>
        <button
          onClick={previewInvoice}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Save Invoice
        </button>
      </div>
    </div>
  );
}

export default InvoiceLineItems;