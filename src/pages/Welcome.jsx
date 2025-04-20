import React from 'react'
import NavBar from '../components/NavBar'
import { useState, useEffect } from "react";

const Welcome = () => {
    const [user, setUser] = useState("");
    useEffect(() => {
      const queryParams = new URLSearchParams(window.location.search);
      setUser(queryParams.get("username"))
      localStorage.setItem("username", queryParams.get("username"));
    }
    , []);
  return (
    <div>
        <NavBar />
        <div className='flex justify-center items-center h-200'>
            <h1 className='text-white text-4xl font-bold'>Welcome {user}</h1>
        </div>
    </div>
  )
}

export default Welcome