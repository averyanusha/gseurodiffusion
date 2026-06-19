import React, {useState} from "react";
import { motion } from 'framer-motion';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://gseurodiffusion.onrender.com';

export default function AdminDashboard() {
  const [rateIsClicked, setRateIsClicked] = useState(false);
  const [currentRate, setCurrentRate] = useState(0);

  const rateHandler = (value) => {
    setCurrentRate(value);
  }

  const saveRateInDb = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/setRate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({currentRate})
    });
    const data = await response.json();
    if (response.ok) {
      setRateIsClicked(false);
    }
  }
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Hello</h1>
      <div className="dashboard-left"></div>
      <div className="dashboard-right">
          {rateIsClicked ? 
            <div>
              <motion.input type="text" id="rate-input" className="rate-input" onChange={(e) => {rateHandler(e.target.value)}}/>
              <button type="button" onClick={saveRateInDb}>Sauvgarder</button>
            </div> : 
            <button className="rate" onClick={() => setRateIsClicked(true)}>{currentRate}
            </button>
          }
          <h2>Last updated by </h2>
      </div>
    </div>
  )
}
