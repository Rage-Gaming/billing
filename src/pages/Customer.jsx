import { useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import FormDialog from '../components/Modal';
import NavBar from '../components/NavBar';
import SearchableDropdown from '../components/Dropdown';

function Customer() {
  const { setCustomer } = useCustomer();
  const navigate = useNavigate();
  const [isModelOpen, setModelIsOpen] = useState(false);
  const [modalName, setModalName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [clients, setClients] = useState([
    { value: '1', label: 'Nidhin', address: 'Kerala', number: '1234567890' },
    // ... other clients
  ]);

  const handleCreate = (newItem) => {
    setModelIsOpen(true);
    setModalName(newItem.label);
  };

  const handleFormSubmit = (data) => {
    const newCustomer = {
      value: Date.now().toString(),
      label: data.name,
      address: data.address,
      number: data.number
    };
    setClients([...clients, newCustomer]);
    setCustomer(newCustomer);
    setSelectedCustomer(newCustomer);
    setModelIsOpen(false);
  };

  const handleContinue = () => {
    if (selectedCustomer) {
      setCustomer(selectedCustomer);
      navigate('/invoice');
    }
  };

  const formFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      defaultValue: modalName
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      required: true
    },
    {
      name: 'number',
      label: 'Mobile No',
      type: 'number',
      required: true,
      inputProps: { maxLength: 10 }
    }
  ];

  return (
    <div className="h-screen">
      <NavBar />
      <div className='flex justify-center items-center h-[80%]'>
        <div className='w-[40%] bg-white rounded-lg shadow-lg p-4'>
          <div className='w-100% m-5'>
            <SearchableDropdown
              options={clients}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              onCreateOption={handleCreate}
              label="Clients"
              placeholder="Search clients..."
            />
          </div>
          
          <div className='m-5 mb-10'>
            Selected:
            {selectedCustomer ? (
              <ul className="list-disc pl-5 mt-2">
                <li>Name: {selectedCustomer.label}</li>
                {selectedCustomer.address && <li>Address: {selectedCustomer.address}</li>}
                {selectedCustomer.number && <li>Phone: {selectedCustomer.number}</li>}
              </ul>
            ) : (
              <span className="text-gray-500"> None</span>
            )}
          </div>
          
          <div className='flex justify-center'>
            <Button 
              variant="contained" 
              onClick={handleContinue}
              disabled={!selectedCustomer}
            >
              Continue to Invoice
            </Button>
          </div>
        </div>
      </div>

      <FormDialog
        open={isModelOpen}
        onClose={() => setModelIsOpen(false)}
        title="Create new customer"
        description="Please enter the details"
        fields={formFields}
        onSubmit={handleFormSubmit}
        submitText="Save"
      />
    </div>
  );
}

export default Customer;