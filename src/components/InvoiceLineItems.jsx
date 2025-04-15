import React, { useState, useEffect, useRef } from 'react';
import { TextField, IconButton, CircularProgress } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const LineItemComponent = ({
  index,
  item,
  itemsList = [],
  onItemChange,
  onInputChange,
  onAddLine,
  onRemoveLine,
  onCreateNewItem,
  isLast,
  autoFocus = false,
  loading
}) => {
  const [localItem, setLocalItem] = useState(item);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if the click was not on the input either
        if (inputRef.current && !inputRef.current.contains(event.target)) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  useEffect(() => {
    if (localItem.rate && localItem.qty) {
      const amount = (parseFloat(localItem.rate) * parseFloat(localItem.qty)).toFixed(2);
      if (amount !== localItem.amount) {
        const updatedItem = {
          ...localItem,
          amount
        };
        setLocalItem(updatedItem);
        onItemChange(index, updatedItem);
      }
    }
  }, [localItem.rate, localItem.qty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedItem = { ...localItem, [name]: value };
    
    setLocalItem(updatedItem);
    onItemChange(index, updatedItem);
    
    if (name === 'description') {
      setSearchQuery(value);
      if (value.length > 1) {
        setShowDropdown(true);
        setLocalLoading(true);
        onInputChange(e);
      } else {
        setShowDropdown(value.length > 0);
        setFilteredItems([]);
      }
    }
  };

  useEffect(() => {
    if (!loading && searchQuery.length > 1) {
      setLocalLoading(false);
      setFilteredItems(itemsList);
    }
  }, [loading, itemsList, searchQuery]);

  const handleItemSelect = (selectedItem) => {
    const updatedItem = {
      ...localItem,
      description: selectedItem.itemName,
      rate: selectedItem.amount.toString(),
      qty: localItem.qty || '1',
      amount: (parseFloat(selectedItem.amount) * parseFloat(localItem.qty || 1)).toFixed(2)
    };
    setLocalItem(updatedItem);
    onItemChange(index, updatedItem);
    setShowDropdown(false);
  };

  const handleCreateNewItem = () => {
    onCreateNewItem(localItem.description);
    setShowDropdown(false);
  };

  const renderDropdownContent = () => {
    if (localLoading) {
      return (
        <div className="px-4 py-2 text-white flex justify-center">
          <CircularProgress size={20} color="inherit" />
        </div>
      );
    }

    if (searchQuery.length === 0) {
      return (
        <div className="px-4 py-2 text-white opacity-70 text-center">
          Start typing to search items
        </div>
      );
    }

    if (searchQuery.length === 1) {
      return (
        <div className="px-4 py-2 text-white opacity-70 text-center">
          Please enter at least 2 characters
        </div>
      );
    }

    if (filteredItems.length === 0 && searchQuery.length > 1) {
      return (
        <div className="px-4 py-2 text-white">
          No items found. 
          <span 
            className="text-blue-300 cursor-pointer ml-1"
            onClick={handleCreateNewItem}
          >
            Create new item "{searchQuery}"
          </span>
        </div>
      );
    }

    return (
      <>
        {filteredItems.map((item, idx) => (
          <li 
            key={idx}
            className="px-4 py-2 text-white hover:bg-gray-600 cursor-pointer"
            onClick={() => handleItemSelect(item)}
          >
            {item.itemName} (${item.amount})
          </li>
        ))}
        <li 
          className="px-4 py-2 text-white hover:bg-gray-600 cursor-pointer bg-gray-800 font-bold"
          onClick={handleCreateNewItem}
        >
          + Create new item: "{searchQuery}"
        </li>
      </>
    );
  };

  return (
    <div className="line-item flex items-center mb-4" style={{ position: 'relative' }}>
      <div className="flex items-center w-full">
        <div className="w-10 text-white flex justify-center">
          {index + 1}
        </div>

        <div className="w-[40%] mx-2 relative">
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            name="description"
            value={localItem.description || ''}
            onChange={handleInputChange}
            onFocus={() => {
              if (localItem.description.length > 0) {
                setShowDropdown(true);
              }
            }}
            autoFocus={autoFocus}
            autoComplete='off'
            placeholder="Item description"
            sx={{
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            }}
          />
          {showDropdown && (
            <ul 
              ref={dropdownRef}
              className="absolute z-10 w-full mt-1 bg-gray-700 border border-white rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {renderDropdownContent()}
            </ul>
          )}
        </div>

        {/* Rest of the component remains the same */}
        <div className="w-[20%] mx-2">
          <TextField
            fullWidth
            size="small"
            type="number"
            name="qty"
            value={localItem.qty || ''}
            onChange={handleInputChange}
            placeholder="Qty"
            inputProps={{ min: "0", step: "0.01" }}
            sx={{
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            }}
          />
        </div>

        <div className="w-[20%] mx-2">
          <TextField
            fullWidth
            size="small"
            type="number"
            name="rate"
            value={localItem.rate || ''}
            onChange={handleInputChange}
            placeholder="Rate"
            inputProps={{ min: "0", step: "0.01" }}
            sx={{
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            }}
          />
        </div>

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
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              width: 'calc(100% - 72px)',
              marginRight: '8px',
            }}
          />

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