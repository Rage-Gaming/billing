import { React, useState } from 'react'
import NavBar from './AdminNavbar'

const Employee = () => {
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
    if (!isAdmin) {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('username');
        return window.location.href = '/login';
    }
  return (
    <section>
        <div>
            <NavBar />
        </div>

        <div className='m-10'>
            <div className='flex flex-col justify-center text-white'>
                <div className='flex flex-col justify-center items-center gap-5'>
                    <h1 className='text-4xl font-bold'>Employee</h1>
                    <p className='text-lg'>Welcome to the Employee page!</p>
                </div>

                <div className='border border-white rounded-md p-5 flex flex-col items-center'>
                    <h2 className='text-2xl font-bold'>Employee Details</h2>
                    <p className='text-lg'>Here you can manage employee details.</p>

                </div>
            </div>
        </div>
    </section>
  )
}

export default Employee