import React, { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

const SearchableDropdown = ({
  options = [],
  value = null,
  onChange = () => {},
  onCreateOption = null,
  label = 'Search Customer',
  placeholder = 'Type customer name or address...',
  noOptionsText = 'No matching customers found',
  createButtonText = 'Create new customer'
}) => {
  const [inputValue, setInputValue] = useState('');

  // Highlight matching text in both name and address
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    
    const parts = [];
    let remainingText = text;
    const lowerQuery = query.toLowerCase();
    
    while (remainingText) {
      const lowerText = remainingText.toLowerCase();
      const index = lowerText.indexOf(lowerQuery);
      
      if (index === -1) {
        parts.push({ text: remainingText, highlight: false });
        break;
      }
      
      if (index > 0) {
        parts.push({
          text: remainingText.substring(0, index),
          highlight: false
        });
      }
      
      parts.push({
        text: remainingText.substring(index, index + query.length),
        highlight: true
      });
      
      remainingText = remainingText.substring(index + query.length);
    }
    
    return parts.map((part, i) => (
      <span
        key={i}
        style={{
          fontWeight: part.highlight ? 600 : 'inherit',
          color: part.highlight ? '#1976d2' : 'inherit'
        }}
      >
        {part.text}
      </span>
    ));
  };

  // Custom filter that searches both name and address
  const filterOptions = (options, { inputValue }) => {
    if (!inputValue) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      (option.address && option.address.toLowerCase().includes(inputValue.toLowerCase()))
    );
  };

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInput) => setInputValue(newInput)}
      getOptionLabel={(option) => option.label || ''}
      isOptionEqualToValue={(option, value) => option.value === value?.value}
      filterOptions={filterOptions}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <ListItem key={key} {...otherProps} sx={{ py: 1.5 }}>
            <Box>
              <div>{highlightMatch(option.label, inputValue)}</div>
              {option.address && (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {highlightMatch(option.address, inputValue)}
                </Typography>
              )}
            </Box>
          </ListItem>
        );
      }}
      ListboxComponent={(props) => (
        <List {...props}>
          {/* Render filtered options */}
          {props.children}
          
          {/* Always show create button at bottom if there's input */}
          {inputValue && (
            <ListItem key="create-new" sx={{ pt: 1, pb: 0 }}>
              <Button 
                fullWidth
                variant="outlined"
                onClick={() => {
                  const newOption = { 
                    value: Date.now().toString(),
                    label: inputValue,
                    address: ''
                  };
                  onCreateOption(newOption);
                  setInputValue('');
                }}
                sx={{
                  backgroundColor: (theme) => theme.palette.grey[50],
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.grey[100],
                  }
                }}
              >
                {createButtonText}
              </Button>
            </ListItem>
          )}
        </List>
      )}
      noOptionsText={
        inputValue ? (
          <Box sx={{ p: 1 }}>
            <Button 
              fullWidth
              variant="outlined"
              onClick={() => {
                const newOption = { 
                  value: Date.now().toString(),
                  label: inputValue,
                  address: ''
                };
                onCreateOption(newOption);
                setInputValue('');
              }}
              sx={{
                backgroundColor: (theme) => theme.palette.grey[50],
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.grey[100],
                }
              }}
            >
              {createButtonText}: "{inputValue}"
            </Button>
          </Box>
        ) : (
          noOptionsText
        )
      }
      renderInput={(params) => (
        <TextField 
          {...params} 
          label={label}
          placeholder={placeholder}
        />
      )}
    />
  );
};

export default SearchableDropdown;