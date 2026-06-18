import React from "react";

import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [rateIsClicked, setRateIsClicked] = useState(false);
  const [currentRate, setCurrentRate] = useState(0);

  const rateHandler = (value) => {
    setCurrentRate(value);
  }
  return (
    <div className="dashboard-container">
      <div className="dashboard-left"></div>
      <div className="dashboard-right">
        <button className="" onClick={() => setRateIsClicked(true)}>
          {rateIsClicked ? 
            <>
              <motion.input type="number" id="rate-input" onChange={() => {rateHandler(input.value)}}/>
              <button>Sauvgarder</button>
            </> : currentRate}
        </button>
      </div>
    </div>
  )
}
