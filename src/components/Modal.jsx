import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const FormDialog = ({open, onClose, title, description, fields, onSubmit, submitText = 'Submit', cancelText = 'Cancel' }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            <TextField
              key={field.name}
              autoFocus={field.autoFocus}
              required={field.required}
              margin="dense"
              minlength={field.length || 0}
              maxlength={field.length || 100}
              name={field.name}
              label={field.label}
              type={field.type || 'text'}
              fullWidth
              variant={field.variant || 'standard'}
              value={formData[field.name] || field.defaultValue || ''}
              onChange={handleChange}
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