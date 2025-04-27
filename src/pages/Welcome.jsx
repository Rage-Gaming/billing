import React from 'react'
import NavBar from '../components/NavBar'
import { useState, useEffect } from "react";

const Welcome = () => {
  const [user, setUser] = useState(localStorage.getItem('username'));
  return (
    <section>
  {!user ? (
    (() => {
      localStorage.removeItem('username');
      window.location.href = '/login';
      return null;
    })()
  ) : (
    <div>
      <NavBar />
      <div className="flex justify-center items-center h-200">
        <h1 className="text-white text-4xl font-bold">Welcome {user}</h1>
      </div>
    </div>
  )}
</section>


  )
}

export default Welcome