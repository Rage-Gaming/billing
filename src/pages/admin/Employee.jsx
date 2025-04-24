import { React, useState, useEffect } from 'react'
import NavBar from './AdminNavbar'
import Cards from '../../components/Cards';
import { Input } from "@/components/ui/input";
import axios from 'axios';
import DialogAlert from '../../components/DialogAlert';

const Employee = () => {
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
    const [users, setUsers] = useState([
        {
            id: 1,  // Added unique id
            userName: "Nidhin",
            email: "test@test.com",
        },
        {
            id: 2,  // Added unique id
            userName: "John",
            email: "john@test.com",
        },
        {
            id: 3,  // Added unique id
            userName: "Doe",
            email: "doe@test.com",
        },
    ]);

    const [query, setQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null); // State to hold the selected user for deletion
    // if (!isAdmin) {
    //     localStorage.removeItem('isAdmin');
    //     localStorage.removeItem('username');
    //     return window.location.href = '/login';
    // }
    const handleOnCardSubmit = (e) => {
        console.log(e)
    }

    const handleOnCardDelete = (e) => {
        setSelectedUser(e);
        setIsDialogOpen(true);
    }

    const handleAlertDialogConfirm = () => {
        console.log('User deleted:', selectedUser); // Debugging line
        setIsDialogOpen(false);
        // Perform the delete operation here, e.g., make an API call to delete the user
        // After deletion, you might want to refresh the user list or remove the user from the state
    }

    // useEffect(() => {
    //     const fetchClients = async () => {
    //     //   setLoading(true);
    //       try {
    //         const response = await axios.post('http://localhost:5000/api/auth/search', { query });

    //         if (response.data.success) {
    //             setUsers(response.data.data);
    //         } else {
    //             setUsers([]);
    //         }
    //       } catch (error) {
    //         console.error('Search error:', error);
    //         setUsers([]);
    //       } finally {
    //         // setLoading(false);
    //       }
    //     };

    //     const delayDebounce = setTimeout(() => {
    //       fetchClients();
    //     }, 300);

    //     return () => clearTimeout(delayDebounce);
    //   }, [query]);

    return (
        <section>
            <div>
                <NavBar />
            </div>
            <DialogAlert />

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
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        {query.length < 2 ? (
                            <div className="flex justify-center items-center h-[43vh]">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold">No results found</h2>
                                <p className="text-gray-500">Try a different search term</p>
                            </div>
                        </div>
                        ) : (
                            <div className='w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-10 p-5'>
                                {users
                                    .filter((user) => {
                                        const q = query.toLowerCase();
                                        return (
                                            user.userName.toLowerCase().includes(q) ||
                                            user.email.toLowerCase().includes(q)
                                        );
                                    })
                                    .map((user, indexNo) => {
                                        console.log(user.id); // Debugging - remove in production
                                        return (
                                            <Cards
                                                key={user.id} // Changed from indexNo to user.id for better React reconciliation
                                                index={user.id}
                                                title={user.userName}
                                                titleDescription={user.email}
                                                defaultName={user.userName}
                                                defaultEmail={user.email}
                                                submit={handleOnCardSubmit}
                                                onDelete={handleOnCardDelete}
                                            />
                                        );
                                    })}

                                {users.filter(user => {
                                    const q = query.toLowerCase();
                                    return (
                                        user.userName.toLowerCase().includes(q) ||
                                        user.email.toLowerCase().includes(q)
                                    );
                                }).length === 0 && (
                                        <div className="col-span-full flex justify-center items-center h-[43vh]">
                                            <div className="text-center">
                                                <h2 className="text-xl font-semibold">No results found</h2>
                                                <p className="text-gray-500">Try a different search term</p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <DialogAlert 
                isOpen={isDialogOpen}
                onCancel={() => setIsDialogOpen(false)} // Handle cancel explicitly
                
                // onOpenChange={setIsDialogOpen}
                onConfirm={handleAlertDialogConfirm}
            />
        </section>
    )
}

export default Employee