import { useState, useEffect, useRef } from 'react';

function InvoiceLineItems() {
  // Items database with localStorage persistence
  const [itemDatabase, setItemDatabase] = useState(() => {
    const savedItems = localStorage.getItem('itemDatabase');
    return savedItems ? JSON.parse(savedItems) : [
      { id: 1, name: 'Brochure Design', rate: 100.00 },
      { id: 2, name: 'Logo Design', rate: 150.00 },
      { id: 3, name: 'Website Development', rate: 500.00 },
      { id: 4, name: 'Social Media Post', rate: 75.00 },
      { id: 5, name: 'Business Card', rate: 50.00 }
    ];
  });

  const [items, setItems] = useState([
    { id: Date.now(), description: '', qty: 1, rate: 0.00, amount: 0.00 }
  ]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', rate: '' });
  const [currentCreatingItemId, setCurrentCreatingItemId] = useState(null);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Save items to localStorage when changed
  useEffect(() => {
    localStorage.setItem('itemDatabase', JSON.stringify(itemDatabase));
  }, [itemDatabase]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.18;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveInput(null);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowCreateModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addNewItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      description: '', 
      qty: 1, 
      rate: 0.00, 
      amount: 0.00 
    }]);
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
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
    // Update the description immediately
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, description: value };
      }
      return item;
    }));
    
    setActiveInput(id);
    
    if (value.length > 0) {
      const filtered = itemDatabase.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  };

  const selectItem = (itemId, selectedItem) => {
    // Check if this item already exists in the list
    const existingItemIndex = items.findIndex(item => 
      item.description === selectedItem.name && item.id !== itemId
    );

    if (existingItemIndex >= 0) {
      // Item exists - increment quantity and remove current line
      setItems(prevItems => {
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          qty: newItems[existingItemIndex].qty + 1,
          amount: (newItems[existingItemIndex].qty + 1) * newItems[existingItemIndex].rate
        };
        // Remove the current line if it's not the existing one
        if (existingItemIndex !== prevItems.findIndex(item => item.id === itemId)) {
          return newItems.filter(item => item.id !== itemId);
        }
        return newItems;
      });
    } else {
      // New item - update current line and add new blank line
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
        // Add new blank line only if this was the last line
        if (itemId === prevItems[prevItems.length - 1].id) {
          return [...updatedItems, { 
            id: Date.now(), 
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
  };

  const handleCreateNewItem = (itemId) => {
    setCurrentCreatingItemId(itemId);
    setNewItem({ name: items.find(item => item.id === itemId).description, rate: '' });
    setShowCreateModal(true);
  };

  const saveNewItem = () => {
    if (!newItem.name || !newItem.rate) return;
    
    const newItemObj = {
      id: Date.now(),
      name: newItem.name,
      rate: parseFloat(newItem.rate)
    };
    
    setItemDatabase([...itemDatabase, newItemObj]);
    
    setItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === currentCreatingItemId) {
          return {
            ...item,
            description: newItemObj.name,
            rate: newItemObj.rate,
            amount: item.qty * newItemObj.rate
          };
        }
        return item;
      });
      // Add new blank line only if this was the last line
      if (currentCreatingItemId === prevItems[prevItems.length - 1].id) {
        return [...updatedItems, { 
          id: Date.now(), 
          description: '', 
          qty: 1, 
          rate: 0.00, 
          amount: 0.00 
        }];
      }
      return updatedItems;
    });
    
    setShowCreateModal(false);
    setNewItem({ name: '', rate: '' });
  };

  return (
    <div className="w-full p-6 text-gray-100 rounded-lg shadow-xl border-2">
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Create New Item</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Item Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                className="p-2 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newItem.rate}
                onChange={(e) => setNewItem({...newItem, rate: e.target.value})}
                step="0.01"
                min="0"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-white rounded focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={saveNewItem}
                className="px-4 py-2 bg-blue-600 text-white rounded focus:outline-none"
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
          <tr className="border-b-2 border-gray-700 bg-[#636363]">
            <th className="text-left py-3 px-4 font-semibold">Item Description</th>
            <th className="text-right py-3 px-4 font-semibold">Qty</th>
            <th className="text-right py-3 px-4 font-semibold">Rate</th>
            <th className="text-right py-3 px-4 font-semibold">Amount</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-gray-800">
              <td className="py-3 relative mr-4">
                <div ref={dropdownRef}>
                  <input
                    type="text"
                    className="p-2 border-1 border-white rounded text-white focus:outline-none focus:ring-2 w-full"
                    value={item.description}
                    onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                    onFocus={() => {
                      setActiveInput(item.id);
                      handleDescriptionChange(item.id, item.description);
                    }}
                    placeholder="Enter item name"
                  />
                  
                  {activeInput === item.id && (
                    <div className="absolute z-10 mt-1 w-full border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredItems.length > 0 ? (
                        <ul>
                          {filteredItems.map((dbItem) => (
                            <li
                              key={dbItem.id}
                              className="p-3 border-b border-gray-700 bg-[#292929] cursor-pointer flex justify-between items-center"
                              onClick={() => selectItem(item.id, dbItem)}
                            >
                              <span className="font-medium">{dbItem.name}</span>
                              <span className="text-sm text-gray-400">₹{dbItem.rate.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : item.description.length > 0 && (
                        <div 
                          className="p-3 border-b border-gray-700  cursor-pointer text-blue-400 font-medium"
                          onClick={() => handleCreateNewItem(item.id)}
                        >
                          + Create "{item.description}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="ml-6 text-right">
                <input
                  type="number"
                  className="w-18 p-2 border border-white rounded text-right text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.qty}
                  onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value || 0))}
                  min="1"
                />
              </td>
              <td className="py-3 text-right">
                <input
                  type="number"
                  className="w-24 p-2 border border-white rounded text-right text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.rate}
                  onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value || 0))}
                  step="0.01"
                />
              </td>
              <td className="py-3 text-right flex justify-end">
                <div className='w-24 p-2 border border-white rounded text-right text-white focus:outline-none focus:ring-2 focus:ring-blue-500'>
                    ₹{item.amount.toFixed(2)}
                </div>
              </td>
              <td className="py-3 px-2 text-center">
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 text-red-400 focus:outline-none itemRemove"
                  title="Delete item"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="py-3 px-4 text-right font-semibold border-t border-gray-700">Subtotal:</td>
            <td className="py-3 px-4 text-right font-medium border-t border-gray-700">₹{subtotal.toFixed(2)}</td>
            <td className="border-t border-gray-700"></td>
          </tr>
          <tr>
            <td colSpan="3" className="py-3 px-4 text-right font-semibold">Tax (18%):</td>
            <td className="py-3 px-4 text-right font-medium">₹{taxAmount.toFixed(2)}</td>
            <td></td>
          </tr>
          <tr>
            <td colSpan="3" className="py-3 px-4 text-right font-bold text-lg">Total:</td>
            <td className="py-3 px-4 text-right font-bold text-lg">₹{total.toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <div className="mt-4 flex justify-between">
        <button
          onClick={addNewItem}
          className="addLine px-4 py-2 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Add Line Item
        </button>
      </div>
    </div>
  );
}

export default InvoiceLineItems;