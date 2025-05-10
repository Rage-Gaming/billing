import React, { useState, useEffect, useRef } from 'react';
import { TextField, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const LineItemComponent = ({
  index,
  item,
  itemsList = [],
  onItemChange,
  onInputChange,
  onRemoveLine,
  onCreateNewItem,
  isLast,
  autoFocus = false,
  loading,
  readOnly = false,
  canAddNewLine, // New prop to control add button visibility
  onRequestAddLine // New prop for add line requests
}) => {
  const [localItem, setLocalItem] = useState(item);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Validate if current item is complete
  const isItemValid = () => {
    return (
      localItem.description?.trim() &&
      !isNaN(parseFloat(localItem.rate)) &&
      !isNaN(parseInt(localItem.qty))
    );
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  // Calculate amount when rate or qty changes
  useEffect(() => {
    if (localItem.rate && localItem.qty) {
      const amount = (parseFloat(localItem.rate) * parseFloat(localItem.qty)).toFixed(2);
      if (amount !== localItem.amount) {
        const updatedItem = { ...localItem, amount };
        setLocalItem(updatedItem);
        onItemChange(index, updatedItem);
      }
    }
  }, [localItem.rate, localItem.qty, index, onItemChange]);

  const handleInputChange = (e) => {
    if (readOnly) return;

    const { name, value } = e.target;
    const updatedItem = { ...localItem, [name]: value };

    setLocalItem(updatedItem);
    onItemChange(index, updatedItem);

    if (name === 'description') {
      setSearchQuery(value);
      setShowDropdown(value.length > 0);
      setLocalLoading(value.length > 1);
      if (value.length > 1) onInputChange(e);
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

  const handleAddLineRequest = () => {
    if (isItemValid()) {
      onRequestAddLine();
    }
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
        <div className="px-4 py-2 text-white opacity-70 text-center printText">
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
        <div className="px-4 py-2 text-white printDisable">
          No items found.
          <span
            className="text-blue-300 cursor-pointer ml-1 printDisable"
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
            className="px-4 py-2 text-white hover:bg-gray-600 cursor-pointer printDisable"
            onClick={() => handleItemSelect(item)}
          >
            {item.itemName} (${item.amount})
          </li>
        ))}
        <li
          className="px-4 py-2 text-white hover:bg-gray-600 cursor-pointer bg-gray-800 font-bold printDisable"
          onClick={handleCreateNewItem}
        >
          + Create new item: "{searchQuery}"
        </li>
      </>
    );
  };

  return (
    <div className="line-item flex items-center mb-4" style={{ position: 'relative', height: '56px' }}>
      <div className="flex items-center w-full h-full">
        {/* Index */}
        <div className="w-10 text-white flex justify-center printText">
          {index + 1}
        </div>

        {/* Description with dropdown */}
        <div className="w-[50%] mx-2 relative h-full">
          {readOnly ? (
            <div className="h-full flex items-center px-2 text-white printText">
              {localItem.description}
            </div>
          ) : (
            <>
              <TextField
                inputRef={inputRef}
                fullWidth
                size="small"
                name="description"
                value={localItem.description || ''}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(localItem.description.length > 0)}
                autoFocus={autoFocus}
                autoComplete="off"
                placeholder="Item description"
                sx={{
                  '& .MuiInputBase-input': {
                    color: 'white', // White text in UI
                    height: '40px',
                    '@media print': {
                      color: 'black', // Black text when printed
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white'
                  },
                  height: '100%',
                  '& .MuiFormHelperText-root': {
                    color: 'white',
                    '@media print': {
                      color: 'black',
                    }
                  }
                }}
                InputProps={{
                  inputProps: {
                    className: 'printText',
                    onKeyDown: (e) => { // For continuous search
                      if (e.key === 'Enter') {
                        handleSearch(); // Your search function
                      }
                    }
                  }
                }}
                error={isLast && !localItem.description?.trim()}
                helperText={isLast && !localItem.description?.trim() ? "Description required" : ""}
              />
              {showDropdown && (
                <ul
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-gray-700 border border-white rounded-md shadow-lg max-h-60 overflow-y-auto"
                  style={{ top: '100%' }}
                >
                  {renderDropdownContent()}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Quantity */}
        <div className="w-[15%] mx-2 h-full">
          {readOnly ? (
            <div className="h-full flex items-center px-2 text-white printText">
              {localItem.qty}
            </div>
          ) : (
            <TextField
              fullWidth
              size="small"
              type="number"
              name="qty"
              value={localItem.qty || ''}
              onChange={handleInputChange}
              placeholder="Qty"
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white', // White text in UI
                  height: '40px',
                  '@media print': {
                    color: 'black', // Black text when printed
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white'
                },
                height: '100%',
                '& .MuiFormHelperText-root': {
                  color: 'white',
                  '@media print': {
                    color: 'black',
                  }
                }
              }}
              inputProps={{
                min: "1",
                step: "1",
                className: 'printText',
                onKeyDown: (e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(); // Your submission function
                  }
                }
              }}
              error={isLast && (!localItem.qty || isNaN(parseInt(localItem.qty)))}
              helperText={
                isLast && (!localItem.qty || isNaN(parseInt(localItem.qty)))
                  ? "Valid quantity required"
                  : ""
              }
            />
          )}
        </div>

        {/* Rate */}
        <div className="w-[15%] mx-2 h-full">
          {readOnly ? (
            <div className="h-full flex items-center px-2 text-white printText">
              {localItem.rate}
            </div>
          ) : (
            <TextField
              fullWidth
              size="small"
              type="number"
              name="rate"
              value={localItem.rate || ''}
              onChange={handleInputChange}
              placeholder="Rate"
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white', // White text in UI
                  height: '40px',
                  '@media print': {
                    color: 'black', // Black text when printed
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white'
                },
                height: '100%',
                '& .MuiFormHelperText-root': {
                  color: 'white',
                  '@media print': {
                    color: 'black',
                  }
                }
              }}
              inputProps={{
                min: "0",
                step: "0.01",
                className: 'printText',
                onKeyDown: (e) => {
                  // Allow decimals and navigation keys
                  if (e.key === 'Enter') {
                    handleSubmit(); // Your submission function
                  }
                }
              }}
              error={isLast && (!localItem.rate || isNaN(parseFloat(localItem.rate)) || parseFloat(localItem.rate) < 0)}
              helperText={
                isLast && (!localItem.rate || isNaN(parseFloat(localItem.rate)) || parseFloat(localItem.rate) < 0)
                  ? "Valid rate required (≥ 0)"
                  : ""
              }
            />
          )}
        </div>

        {/* Amount */}
        <div className="w-[15%] mx-2 h-full pr-6">
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
                height: '40px',
                '@media print': {
                  color: 'black !important', // Force black text in print
                  WebkitPrintColorAdjust: 'exact' // Ensures color renders in print
                }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white'
              },
              height: '100%',
              '@media print': {
                '& .MuiInputBase-root': {
                  backgroundColor: 'transparent !important'
                }
              }
            }}
            InputProps={{
              readOnly: true,
              inputProps: {
                className: 'printText'
              }
            }}
          />
        </div>

        {/* Action buttons */}
        {!readOnly && (
          <div className="w-[40px] flex justify-center">
            {index > 0 && (
              <IconButton
                onClick={() => onRemoveLine(index)}
                size="small"
                sx={{ color: 'white' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LineItemComponent;