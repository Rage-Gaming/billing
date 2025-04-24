import { React, useState } from 'react'
import NavBar from './AdminNavbar'
import Cards from '../../components/Cards';
import { Input } from "@/components/ui/input";

const Employee = () => {
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
    // if (!isAdmin) {
    //     localStorage.removeItem('isAdmin');
    //     localStorage.removeItem('username');
    //     return window.location.href = '/login';
    // }
    const handleOnSubmit = (e) => {
        console.log(e)
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

                    <div className='border border-white rounded-md flex flex-col'>
                        <div className='flex items-center p-5 w-full border-b border-white mb-3'>
                            <Input
                                type="text"
                                placeholder="Search Employee"
                                className="w-[15%] bg-white text-black"
                            />
                        </div>
                        
                        <div className='w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-10 p-5'>
                            <Cards
                                title="Test"
                                titleDescription="Change the details of the employee"
                                defaultName="Nidhin"
                                defaultEmail="test@test.com"
                                submit={handleOnSubmit}
                            />
                            <Cards
                                title="Test"
                                titleDescription="Change the details of the employee"
                                defaultName="Nidhin"
                                defaultEmail="test@test.com"
                                submit={handleOnSubmit}
                            />
                            <Cards
                                title="Test"
                                titleDescription="Change the details of the employee"
                                defaultName="Nidhin"
                                defaultEmail="test@test.com"
                                submit={handleOnSubmit}
                            />
                            <Cards
                                title="Test"
                                titleDescription="Change the details of the employee"
                                defaultName="Nidhin"
                                defaultEmail="test@test.com"
                                submit={handleOnSubmit}
                            />
                            <Cards
                                title="Test"
                                titleDescription="Change the details of the employee"
                                defaultName="Nidhin"
                                defaultEmail="test@test.com"
                                submit={handleOnSubmit}
                            />
                            <Cards
                                title="Test"
                                titleDescription="Change the details of the employee"
                                defaultName="Nidhin"
                                defaultEmail="test@test.com"
                                submit={handleOnSubmit}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Employee