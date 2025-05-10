import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { FaCloudSun } from "react-icons/fa";
import logo from "../assets/logo.png"; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState('');
  const [time, setTime] = useState('--:--:--');
  const [date, setDate] = useState('Loading date...');
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDate(now.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`/api/auth/login`, {
        email,
        password,
      });
      console.log(data);
  
      if (role === "admin" && data.user.isAdmin !== true) {
        setError("You are not an admin");
        return;
      }
  
      if (role === "admin" && data.user.isAdmin === true) {
        navigate("/admin");
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("isAdmin", data.user.isAdmin);
        return;
      }
  
      if (data.user.username) {
        navigate(`/welcome`);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("isAdmin", data.user.isAdmin);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Invalid credentials. Please try again.");
        return;
      } else if (error.response && error.response.status === 400) {
        setError("Email already in use. Please try a different email.");
        return;
      } else if (error.response && error.response.status === 500) {
        setError("Server error. Please try again later.");
        return;
      } else if (error.response && error.response.status === 403) {
        setError("You are not authorized to access this page.");
        return;
      } else if (error.response && error.response.status === 404) {
        setError("User not found. Please check your email.");
        return;
      } else if (error.response && error.response.status === 429) {
        setError("Too many requests. Please try again later.");
        return;
      } else if (error.response && error.response.status === 503) {
        setError("Service unavailable. Please try again later.");
        return;
      }
      setError("Something went wrong.");
    }
  };

  return (
    <div className="flex h-screen mx-auto shadow-lg rounded-lg overflow-hidden">
      {/* Left side - Login Form */}
      <div className="flex-1 p-10 bg-white flex flex-col justify-center">
        <div className='p-5 flex justify-center w-full'>
          <img src={logo} alt="logo" className='w-24 mb-10'/>
        </div>
        <form onSubmit={handleLogin} className="w-full">
          <div className="mb-5">
            <label htmlFor="role" className="block font-bold mb-2">Select Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="client">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mb-5">
            <label htmlFor="email" className="block font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="password" className="block font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full p-2 bg-[#ef3e59] text-white font-bold rounded-md hover:bg-[#ef3e59] transition-colors cursor-pointer"
          >
            Log In
          </button>
        </form>
      </div>

      {/* Right side - Time and Weather */}
      <div className="flex-1 p-10 bg-[#ef3e59] text-white flex flex-col justify-center items-center text-center">
        <div className="mb-8">
          <div className="text-5xl font-bold mb-2">{time}</div>
          <div className="text-xl">{date}</div>
        </div>
        <div className="flex flex-col items-center">
          <FaCloudSun className="text-5xl mb-3" />
          <div className="text-xl">28°C</div>
          <div className="text-xl">Partly Cloudy</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;