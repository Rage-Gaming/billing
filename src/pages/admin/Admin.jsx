import { React, useState } from 'react'
import AdminNavbar from './AdminNavbar'
import Button from '@mui/material/Button';
import FormDialog from '../../components/Modal';
import axios from 'axios';

const Admin = () => {
  const [isModelOpen, setModelIsOpen] = useState(false);

  const formFields = [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email ID',
      type: 'email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'text',
      required: true
    },
    {
      name: 'admin',
      label: 'Admin user',
      type: 'checkbox',
    },
  ];

  const handleNewUserRegisterFormSubmit = (data) => {
    axios.post('http://localhost:5000/api/auth/register', data)
      .then((response) => {
        setModelIsOpen(false);
      })
      .catch((error) => {
        console.error('There was an error!', error);
      });
    console.log(data);
  }

  const handleNewEmployee = () => {
    setModelIsOpen(true);
  }
  return (
    <div>
      <div className='m-5'>
        <AdminNavbar />
      </div>
      <div className='flex justify-between m-5 p-5'>
        <Button variant="contained" onClick={handleNewEmployee}>
          Create new Employee
        </Button>

        <Button variant="contained" onClick={() => window.location.href = '/customer'}>
          Manage Employees
        </Button>

        <Button variant="contained" onClick={() => window.location.href = '/customer'}>
          Invoice History
        </Button>

        <FormDialog
        open={isModelOpen}
        onClose={() => setModelIsOpen(false)}
        title="Create new user"
        description="Please enter the details"
        fields={formFields}
        onSubmit={handleNewUserRegisterFormSubmit}
        submitText="Create"
      />

      </div>
    </div>
  )
}

export default Admin