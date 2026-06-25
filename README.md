# GS EURODIFFUSION

A 10-page responsive fullstack website for a company specializing in copper and wire reselling on the international scale. 
The client wanted a clean, industry-adapted design with modern features such as an animated timeline, partners band and a live copper exchange rate.

The most complex part of this project was the admin page, built with JWT authentication. Its sole purpose is to let the client log in and save an up-to-date copper rate. The rate is stored in a PostgreSQL table, then extracted with the quieries to display the latest rate in the header, while older values populate a rate calendar built as a React component.

## The project built with

- HTML5
- Sass
- JavaScript
- React
- Node.js
- Express.js
- REST API
- Chart.js
- Gulp
- PostgreSQL

## Development steps

1. UX/UI design for both desktop and mobile
2. Complete frontend architecture
3. Visual timeline of company history
4. Interactive 12-month copper price chart
5. Interactive calendar for historical rate consultation
6. Contact form with backend validation (Node.js/Express)
7. Responsive design optimized for mobile and desktop
8. Intuitive navigation and multi-page architecture
9. Designed a PostgreSQL database with tables for user authentication and copper rate history
10.Built Express routes to securely store, update, and retrieve rates from the database, including hashed credentials and JWT-protected admin access
