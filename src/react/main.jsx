import React from 'react';
import { createRoot } from 'react-dom/client';
import CalendarComponent from './components/CalendarComponent.jsx';
import PartnerSlider from './components/PartnerSlider.jsx';
import Timeline from './components/TimelineComponent.jsx';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error}){
  return <p>Une erreur est survenue dans le calendrier.</p>
}

const calendarContainer = document.getElementById('calendar-root');
const carouselContainer = document.getElementById('carousel-root');
const timelineContainer = document.getElementById('timeline-root');

if (calendarContainer) {
  createRoot(calendarContainer).render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <CalendarComponent />
      </ErrorBoundary>
  );
} else if (carouselContainer) {
  createRoot(carouselContainer).render(
      <PartnerSlider />);
} else if (timelineContainer) {
  createRoot(timelineContainer).render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Timeline />
    </ErrorBoundary>
  )
} else {
  console.warn('No matching React component root found on this page.');
}