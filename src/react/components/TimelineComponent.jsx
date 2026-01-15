import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { check } from 'express-validator';
import { Dot } from 'lucide-react';

const timelineItems = [
  { date: "1991", text: "Création de GS EURODIFFUSION. Société de négoce basée à Paris." },
  { date: "2001", text: "Déménagement à Lutterbach. Spécialisation dans l’import/export de matériel électrique ; intégration aux locaux de TPH." },
  { date: "2019", text: "Obtention carte d'agent commercial France pour les câbles FR- N07V-AR d’ALCOBRE (Portugal)." },
  { date: "Jan 2024", text: "Obtention carte d'agent commercial France pour les câbles H07V- U/R de KABLO VRCHLABI (Tchèquie)" },
  { date: "Fev 2024", text: "Intégration au groupe OTEPA" },
  { date: "2025", text: "Déménagement à St Etienne de St Geoirs (38) dans les locaux du groupe." },
];
function TimelineBubble({ date, text, position }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 786);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (isMobile) {
    return (
      <div className='bubble-container-mobile'>
        <div className='bubble-dot'></div>
        <div className='bubble-mobile-wrapper'>
          <div className='bubble-mobile-date'>{date}</div>
          <div className='bubble'>
            <p className='bubble-text'>{text}</p>
          </div>
        </div>
      </div>
    )
  }
  const bubbleVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  };

  const textVariants = {
    rest: { opacity: 0, y: 10, transition: { duration: 0.2 } },
    hover: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const dateVariants = {
    rest: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  // Use BEM notation for class names
  const containerClasses = `bubble-container bubble-container--${position}`;

  return (
    <div className={containerClasses}>
      <div className="bubble-dot"></div>
      <div className="bubble-stem"></div>
      <motion.div
        className="bubble"
        variants={bubbleVariants}
        initial="rest"
        whileHover="hover"
        animate="rest"
      > 
        <motion.div
          className="bubble-content"
          variants={dateVariants}
        >
          <span className="bubble-date">{date}</span>
        </motion.div>
        <motion.div
          className="bubble-content bubble-content--text"
          variants={textVariants}
        >
          <p className="bubble-text">{text}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Timeline() {
  return (
    <div className="timeline-container">
      <h1 className="timeline-title">
        Notre Histoire
      </h1>
      <div className="timeline-wrapper">
        <div className="timeline-line"></div>
        <div className="timeline-events">
          {timelineItems.map((item, index) => (
            <div key={index} className="timeline-event">
              <TimelineBubble
                date={item.date}
                text={item.text}
                position={index % 2 === 0 ? 'top' : 'bottom'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}