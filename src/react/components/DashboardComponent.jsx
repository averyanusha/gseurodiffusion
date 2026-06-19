import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import Login from './LoginComponent';
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://gseurodiffusion.onrender.com';

export default function Dashboard() {
  const [isLoggedin, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkIfToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) 
        return;

      const response = await fetch(`${API_URL}/api/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok){
        setIsLoggedIn(true);
      }
    }
  checkIfToken();
  },[])

  return (
    <div className="dashboard">
      {isLoggedin ? <AdminDashboard /> : <Login onSuccess={() => setIsLoggedIn(true)}/>}
    </div>
  )
}