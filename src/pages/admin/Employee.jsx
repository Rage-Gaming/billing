import { React, useState, useEffect } from 'react'
import NavBar from './AdminNavbar'
import Cards from '../../components/Cards';
import { Input } from "@/components/ui/input";
import axios from 'axios';
import DialogAlert from '../../components/DialogAlert';
import { toast } from 'sonner';

const Employee = () => {
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
    const [users, setUsers] = useState([
        { // Mock data
            id: 1,  // Added unique id
            username: "Nidhin",
            email: "test@test.com",
        },
        {
            id: 2,  // Added unique id
            username: "John",
            email: "john@test.com",
        },
        {
            id: 3,  // Added unique id
            username: "Doe",
            email: "doe@test.com",
        },
    ]);

    const [query, setQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null); // State to hold the selected user for deletion
    if (!isAdmin) {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('username');
        return window.location.href = '/login';
    }
    const handleOnCardSubmit = (e) => {
        console.log(e)
    }

    const handleOnCardDelete = (e) => {
        setSelectedUser(e);
        setIsDialogOpen(true);
    }

    const handleAlertDialogConfirm = async () => {
        try {
            setIsDialogOpen(false);
        const response = await axios.post('/api/auth/delete', { email: selectedUser.email });
        if (response.data.success) {
            toast.success('User deleted successfully');
            setUsers((prevUsers) => prevUsers.filter((user) => user.email !== selectedUser.email));
        }
        } catch (error) {
            toast.error(error.response.data.message);
            
        }
        
    }

    useEffect(() => {
        const fetchClients = async () => {
        //   setLoading(true);
          try {
            const response = await axios.post('/api/auth/search', { query });

            if (response.data.success) {
                setUsers(response.data.data);
            } else {
                setUsers([]);
            }
          } catch (error) {
            console.error('Search error:', error);
            setUsers([]);
          } finally {
            // setLoading(false);
          }
        };

        const delayDebounce = setTimeout(() => {
          fetchClients();
        }, 300);

        return () => clearTimeout(delayDebounce);
      }, [query]);

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
                        {query?.length < 2 ? (
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
                                        const q = query?.toLowerCase();
                                        return (
                                            user?.username?.toLowerCase().includes(q) ||
                                            user?.email?.toLowerCase().includes(q)
                                        );
                                    })
                                    .map((user, indexNo) => {
                                        return (
                                            <Cards
                                                key={indexNo} // Changed from indexNo to user.id for better React reconciliation
                                                index={user.id}
                                                title={user.username}
                                                titleDescription={user.email}
                                                defaultName={user.username}
                                                defaultEmail={user.email}
                                                submit={handleOnCardSubmit}
                                                onDelete={handleOnCardDelete}
                                            />
                                        );
                                    })}

                                {users.filter(user => {
                                    const q = query?.toLowerCase();
                                    return (
                                        user?.username?.toLowerCase().includes(q) ||
                                        user?.email?.toLowerCase().includes(q)
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