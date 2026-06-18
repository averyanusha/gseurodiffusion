import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import Login from './LoginComponent';

export default function Dashboard() {
  const [isLoggedin, setIsLoggedIn] = useState(false);
  return (
    isLoggedin ? <AdminDashboard /> : <Login onSuccess={() => setIsLoggedIn(true)}/>
  )
}