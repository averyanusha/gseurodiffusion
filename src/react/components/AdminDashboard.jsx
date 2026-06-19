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
    const response = await fetch(`${API_URL}/api/setRate`, {
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({currentRate})
    });
    const data = await response.json();
    if (response.ok) {

    }
  }
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Hello</h1>
      <div className="dashboard-left"></div>
      <div className="dashboard-right">
        <button className="rate" onClick={() => setRateIsClicked(true)}>
          {rateIsClicked ? 
            <>
              <motion.input type="text" id="rate-input" className="rate-input" onChange={() => {rateHandler(input.value)}}/>
              <button>Sauvgarder</button>
            </> : currentRate}
        </button>
      </div>
    </div>
  )
}
