import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';

const FormDialog = ({ open, onClose, title, description, fields, onSubmit, submitText = 'Submit', cancelText = 'Cancel' }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && <DialogContentText>{description}</DialogContentText>}
        <form onSubmit={handleSubmit} id="modal-form">
          {fields.map((field) => (
            field.type === 'checkbox' ? (
              <div key={field.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <Checkbox
                  name={field.name}
                  checked={Boolean(formData[field.name])} // Ensure boolean
                  onChange={handleChange}
                />
                <label htmlFor={field.name}>{field.label}</label>
              </div>
            ) :
              <TextField
                key={field.name}
                autoFocus={field.autoFocus}
                required={field.required}
                margin="dense"
                minLength={field.length || 0}
                maxLength={field.length || 100}
                name={field.name}
                label={field.label}
                type={field.type || 'text'}
                fullWidth
                variant={field.variant || 'standard'}
                value={formData[field.name] || field.defaultValue || ''}
                onChange={handleChange}
                autoComplete="off"
              />
          ))}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button type="submit" form="modal-form">{submitText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;