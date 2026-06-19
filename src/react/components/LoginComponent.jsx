import React, { useState } from 'react';
import { motion } from 'framer-motion';
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://gseurodiffusion.onrender.com';

export default function Login({ onSuccess }){
  const [loginCheck, setLoginCheck] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch (`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      onSuccess()
    }
  }

  return (
    <motion.div className='login'>
      <motion.form onSubmit={handleLogin} className='login-form'>
        <input type="text" id='username' placeholder='Login' onChange={(e) => {setUsername(e.target.value)}} onKeyDown={handleLogin}/>
        <div className="password-wrapper">
          <input type={showPassword ? 'text' : 'password'} id='password' placeholder='Mot de passe' onChange={(e) => {setPassword(e.target.value)}} />
          <button type='button' onClick={() => {setShowPassword(!showPassword)}} className={showPassword ? 'password-button visible-password' : 'password-button hidden-password'}></button>
        </div>
        <button type="submit" className="login-button">Se connecter</button>
      </motion.form>
    </motion.div>
  )
}