import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { TextField, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const LineItemComponent = ({
  index,
  item,
  itemsList = [],
  onItemChange,
  onAddLine,
  onRemoveLine,
  onCreateNewItem,
  isLast,
  autoFocus = false
}) => {
  const [localItem, setLocalItem] = useState(item);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedItem = { ...localItem, [name]: value };
    
    // Calculate amount if qty or rate changes
    if (name === 'qty' || name === 'rate') {
      const qty = parseFloat(updatedItem.qty) || 0;
      const rate = parseFloat(updatedItem.rate) || 0;
      updatedItem.amount = (qty * rate).toFixed(2);
    }
    
    setLocalItem(updatedItem);
    onItemChange(index, updatedItem);
    
    // Show dropdown only for description changes
    if (name === 'description') {
      setSearchQuery(value);
      if (value.length > 1) {
        setShowDropdown(true);
        filterItems(value);
      } else {
        setShowDropdown(false);
      }
    }
  };

  const filterItems = debounce((searchTerm) => {
    const filtered = itemsList.filter(item => 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, 300);

  const handleItemSelect = (selectedItem) => {
    const updatedItem = {
      ...localItem,
      description: selectedItem.description,
      rate: selectedItem.rate,
      qty: selectedItem.qty || localItem.qty || 1,
      amount: ((selectedItem.rate || 0) * (selectedItem.qty || localItem.qty || 1)).toFixed(2)
    };
    setLocalItem(updatedItem);
    onItemChange(index, updatedItem);
    setShowDropdown(false);
  };

  const handleCreateNewItem = () => {
    onCreateNewItem(searchQuery);
    setShowDropdown(false);
  };

  return (
    <div className="line-item flex items-center mb-4" style={{ position: 'relative' }}>
      <div className="flex items-center w-full">
        {/* Index number */}
        <div className="w-10 text-white flex justify-center">
          {index + 1}
        </div>

        {/* Item description with dropdown */}
        <div className="w-[40%] mx-2 relative">
          <TextField
            fullWidth
            size="small"
            name="description"
            value={localItem.description || ''}
            onChange={handleInputChange}
            autoFocus={autoFocus}
            placeholder="Item description"
            sx={{
              '& .MuiInputBase-input': {
                color: 'white',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
            }}
          />
          {showDropdown && (
            <ul className="absolute z-10 w-full mt-1 bg-gray-700 border border-white rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredItems.length > 0 ? (
                <>
                  {filteredItems.map((item, idx) => (
                    <li 
                      key={idx}
                      className="px-4 py-2 text-white hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleItemSelect(item)}
                    >
                      {item.description} (${item.rate})
                    </li>
                  ))}
                  <li 
                    className="px-4 py-2 text-white hover:bg-gray-600 cursor-pointer bg-gray-800 font-bold"
                    onClick={handleCreateNewItem}
                  >
                    + Create new item: "{searchQuery}"
                  </li>
                </>
              ) : (
                <li 
                  className="px-4 py-2 text-white hover:bg-gray-600 cursor-pointer bg-gray-800 font-bold"
                  onClick={handleCreateNewItem}
                >
                  + Create new item: "{searchQuery}"
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Quantity */}
        <div className="w-[20%] mx-2">
          <TextField
            fullWidth
            size="small"
            type="number"
            name="qty"
            value={localItem.qty || ''}
            onChange={handleInputChange}
            placeholder="Qty"
            min="0"
            step="0.01"
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

        {/* Rate */}
        <div className="w-[20%] mx-2">
          <TextField
            fullWidth
            size="small"
            type="number"
            name="rate"
            value={localItem.rate || ''}
            onChange={handleInputChange}
            placeholder="Rate"
            min="0"
            step="0.01"
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

        {/* Amount and Actions */}
        <div className="w-[20%] mx-2 flex items-center">
          <TextField
            fullWidth
            size="small"
            name="amount"
            value={localItem.amount || '0.00'}
            readOnly
            sx={{
              '& .MuiInputBase-input': {
                color: 'white',
                textAlign: 'right',
                paddingRight: '8px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
              width: 'calc(100% - 72px)',
              marginRight: '8px',
            }}
          />

          {/* Action buttons */}
          <div className="flex" style={{ width: '64px' }}>
            {isLast && (
              <IconButton onClick={onAddLine} size="small" sx={{ color: 'white' }}>
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            )}
            {index > 0 && (
              <IconButton onClick={() => onRemoveLine(index)} size="small" sx={{ color: 'white' }}>
                <RemoveCircleOutlineIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineItemComponent;