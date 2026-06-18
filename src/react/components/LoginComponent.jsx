import React, { useState } from 'react';
import { motion } from 'framer-motion';
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://gseurodiffusion.onrender.com';

export default function Login({ onSuccess }){
  const [loginCheck, setLoginCheck] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch (`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
    });
    if (response.ok) {
      onSuccess()
    }
  }

  return (
    <motion.div className='login'>
      <motion.form onSubmit={handleLogin} className='login-form'>
        <input type="text" className="login-input" id='username' placeholder='Login' onChange={(e) => {setUsername(e.target.value)}}/>
        <input type="password" className="login-input" id='password' placeholder='Mot de passe' onChange={(e) => {setPassword(e.target.value)}} />
        <button type="submit" className="login-button">Se connecter</button>
      </motion.form>
    </motion.div>
  )
}