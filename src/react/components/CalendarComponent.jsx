import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = "https://gseurodiffusion.onrender.com";

export default function CopperExchangeCalendar() {
  const [currentEndDate, setCurrentEndDate] = useState(new Date());
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []); 
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calendarDays = useMemo(() => {
    const days = [];
    const tempEndDate = new Date(currentEndDate);
    tempEndDate.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), 1);
    let firstDayOfCalendar = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfCalendar.getDay(); 
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - diff);

    for (let i = 0; i < 35; i++) { 
      const date = new Date(firstDayOfCalendar);
      date.setDate(firstDayOfCalendar.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentEndDate]);

useEffect(() => {
  const fetchRates = async () => {
    setLoading(true);
    setError(null);

    try {
      // Only weekdays, and don’t fetch future days
      const validDates = calendarDays.filter(d => d <= today && d.getDay() !== 0 && d.getDay() !== 6).map(d => d.toISOString().split("T")[0]);

      if (validDates.length > 0) {
        const start = validDates[0];
        const end = validDates[validDates.length - 1];

        const response = await fetch(`${API_URL}/exchange-rate/calendar-rates?start=${start}&end=${end}`);
        if (!response.ok){
          throw new Error(`HTTP error: ${response.status}`)
        };
        const fetchedRates = await response.json(); 
        setRates(fetchedRates);
      } else {
        setRates({});
      }
    } catch (err) {
      console.error("Failed to fetch rates:", err);
      setError("Échec du chargement des taux de change. Veuillez réessayer.");
      setRates({});
    } finally {
      setLoading(false);
    }
  };

  fetchRates();
}, [calendarDays, today]);

  const goToPreviousPeriod = () => {
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(1);
    newEndDate.setDate(newEndDate.getDate() - 1);
    setCurrentEndDate(newEndDate);
  };

  const goToNextPeriod = () => {
    setCurrentEndDate(new Date()); // Set end date to a new Date object representing today
  }; 

  const handleDateClick = (date, rate) => {
    if (!isMobile) return;
    if (!rate) return;
    
    const dateString = date.toISOString().split('T')[0];
    
    if (selectedDate === dateString) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateString);
    }
  };
  const currentMonthYearLabel = `${months[currentEndDate.getMonth()]} ${currentEndDate.getFullYear()}`;
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const isWeekend = () => {
    if(dayNames !== 'Sam' || dayNames !== 'Dim'){

    }
  }
  return (
    <div className="copper-calendar-container">
      <div className="calendar-header">
        <button onClick={goToPreviousPeriod} aria-label="Go to previous 4 weeks">
          <ChevronLeft size={24} />
        </button>
        {currentEndDate.toDateString() !== today.toDateString() && 
        <button onClick={goToNextPeriod}>
          <ChevronRight size={24} />
        </button>
        }
        <div className="calendar-title-group">
          <h2>Calendrier des variations du taux de change de cuivre</h2>
          <div className="month-label">{currentMonthYearLabel}</div>
        </div>
      </div>
      {loading && <div className="loading-message">Chargement des taux de change...</div>}
      {error && <div className="error-message">Erreur: {error}</div>}

      {!loading && !error && (
        <div className="calendar-grid">
          {dayNames.map(name => (
            <div key={name} className="day-name">{name}</div>
          ))}
          {calendarDays.map((date, index) => {
            const dateString = date.toISOString().split('T')[0];
            const rate = rates[dateString];
            const isToday = date.toDateString() === today.toDateString();
            const isFutureDate = date > today;
            const dayOfWeek = date.getDay(); 
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isCurrentMonth = date.getMonth() === currentEndDate.getMonth();
            const isSelected = selectedDate === dateString;

            let displayContent = null;
            let rateClass = '';

            if (isFutureDate) {
              displayContent = null;
            } else if (isWeekend) {
                  if (isMobile) {
                    displayContent = isSelected ? <span className="no-data">Fermé</span> : null;
                  } else {
                    displayContent = <span className="no-data">Fermé</span>;
                  }
                rateClass = 'no-data';
            } else if (rate !== null && rate !== undefined) {
              if (isMobile) {
                displayContent = isSelected ? `${rate.toFixed(0)}€/t` : null;
              } else {
                displayContent = `${rate.toFixed(0)}€/t`;
              }
            } else {
              displayContent = null;
            }
            return (
              <div
                key={dateString}
                className={`calendar-day ${isToday ? 'today' : ''} ${isCurrentMonth ? 'current-month' : ''} ${isSelected ? 'selected' : ''} ${rate && isMobile ? 'clickable' : ''}`}
                onClick={() => handleDateClick(date, rate)}
              >
                <div className="day-number">{date.getDate()}</div>
                <div className={`exchange-rate ${rateClass}`}>
                  {displayContent}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {isMobile && (
        <div className="mobile-hint">
          💡 Choisissez une date pour voir le taux
        </div>
      )}
    </div>
  );
};
