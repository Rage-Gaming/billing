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
        toast.success('User created successfully!');
        setModelIsOpen(false);
      })
      .catch((error) => {
        console.error('There was an error!', error);
        toast.error('Error creating user!');
      });
  }

  const handleNewEmployee = () => {
    setModelIsOpen(true);
  }

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login';
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

        <Button variant="contained" onClick={() => window.location.href = '/admin/employees'}>
          Manage Employees
        </Button>

        <Button variant="contained" onClick={() => window.location.href = '/history'}>
          Invoice History
        </Button>

        <Button variant="contained" onClick={handleLogout}>
          Log Out
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