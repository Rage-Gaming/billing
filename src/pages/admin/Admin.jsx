import { React, useState } from 'react'
import AdminNavbar from './AdminNavbar'
import Button from '@mui/material/Button';
import FormDialog from '../../components/Modal';

const Admin = () => {
  const [isModelOpen, setModelIsOpen] = useState(false);

  const formFields = [
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
  ];

  const handleFormSubmit = (data) => {
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
        onSubmit={handleFormSubmit}
        submitText="Create"
      />

      </div>
    </div>
  )
}

export default Admin