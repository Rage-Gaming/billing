import { useCustomer } from '../context/CustomerContext';
import SearchableDropdown from '../components/Dropdown';
import { useNavigate } from "react-router-dom";
import FormDialog from '../components/Modal';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import NavBar from '../components/NavBar';
import { toast } from 'sonner';
import axios from 'axios';

export default function Customer() {
  const { setCustomer } = useCustomer();
  const navigate = useNavigate();
  const [isModelOpen, setModelIsOpen] = useState(false);
  const [modalName, setModalName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  //Client search data
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState([]);
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const invoiceStatus = queryParams.get("invoiceStatus");
  
    if (invoiceStatus === "success") {
      // Use a timeout to ensure everything is mounted
      setTimeout(() => {
        if (!window.__toast_shown__) {
          toast.success("Invoice generated successfully!");
          window.__toast_shown__ = true; // prevent duplicate toasts
        }
      }, 0);
    }
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      if (query.trim().length < 2) {
        setClients([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.post(`/api/clients/search`, { query });

        if (response.data.success) {
          setClients(response.data.data);
        } else {
          setClients([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchClients();
    }, 300); // debounce to avoid rapid API calls

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleCreate = (newItem) => {
    setModelIsOpen(true);
    setModalName(newItem.label);
  };

  const handleNewCustomerFormSubmit = (data) => {
    const newCustomer = {
      clientName: data.clientName,
      address: data.address,
      number: data.number
    };
    // setClients([...clients, newCustomer]);
    // setCustomer(newCustomer);
    // setSelectedCustomer(newCustomer);
    axios.post(`/api/clients/register`, newCustomer)
      .then((response) => {
        console.log(response.data.data);
        setClients([...clients, response.data.data]);
        setSelectedCustomer(response.data.data);
        setCustomer(response.data.data);
        setModelIsOpen(false);
        toast.success('Customer created successfully!');
      }
    ).catch((error) => {
      console.error('Error creating new customer:', error);
      if (error.response && error.response.status === 409) {
        toast.error("Client with this phone number already exists");
        return;
      }
      if (error.respons.data.message) {
        toast.error(error.response.data.message);
        return;
      }
    }
    );
  };

  const handleContinue = () => {
    if (selectedCustomer) {
      setCustomer(selectedCustomer);
      navigate('/invoice?new=true');
    }
  };

  const formFields = [
    { name: 'clientName', label: 'Full Name', type: 'text', required: true, defaultValue: modalName},
    { name: 'address', label: 'Address', type: 'text', required: true },
    { name: 'number', label: 'Mobile No', type: 'number', required: true, inputProps: { maxLength: 10 }}
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
              onInputChange={setQuery} // 👈 This is key
              label="Clients"
              placeholder="Search clients..."
            />
          </div>
          
          <div className='m-5 mb-10'>
            Selected:
            {selectedCustomer ? (
              <ul className="list-disc pl-5 mt-2">
                <li>Name: {selectedCustomer.clientName}</li>
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
        onSubmit={handleNewCustomerFormSubmit}
        submitText="Save"
      />
    </div>
  );
}