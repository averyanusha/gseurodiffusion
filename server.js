import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { body, validationResult } from "express-validator";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import {getCurrentExchangeRate, getMonthsRates, getCalendarRates } from "./exchangeRate.js";
import { createRequire } from "module";
import searchRoutes from "./search.js"

console.log("✅ Search routes imported:", searchRoutes);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;

dotenv.config();
const require = createRequire(import.meta.url);

const USER_EMAIL = process.env.EMAIL_USER;
const USER_PASS = process.env.EMAIL_PASS;

app.get("/exchange-rate", async (req, res) => {
  try {
    const data = await getCurrentExchangeRate();
    // const eurPerUsd = await getEurToUsdExchangeRate();
    console.log(data)
    if (data && typeof data === 'number') {
      // const eurPerTon = usdPerLb * 2204.62 * eurPerUsd; // lb → tonne, USD → EUR
      res.json({ data });
    } else {
      res.status(500).json({ error: "Exchange rate data incomplete." });
    }
  } catch (err) {
    console.error("[server.js] Error in /exchange-rate:", err);
    res.status(500).json({ error: "Exchange rate fetch failed" });
  }
})

app.get("/exchange-rate/last-12-months", async (req, res) => {
  try {
    const data = await getMonthsRates();
    res.json(data);
  } catch (err) {
    console.error("[server.js] Error in /exchange-rate/last-12-months:", err);
    res.status(500).json({ error: "Monthly exchange rate fetch failed" });
  }
})

app.get("/exchange-rate/calendar-rates", async (req, res) => {
  try {
    const { start, end } = req.query;
    const iso = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
    
    if (!iso(start) || !iso(end)) {
      return res.status(400).json({ error: "Missing or invalid start/end (YYYY-MM-DD)" });
    }
    if (start > end) {
      return res.status(400).json({ error: "start must be <= end" });
    }

    // Get rates directly in EUR/tonne from your function
    const pricePerTonByDate = await getCalendarRates(start, end);

    res.json(pricePerTonByDate);
    
  } catch (err) {
    console.error("[server.js] Error in /exchange-rate/calendar-rates:", err);
    res.status(500).json({ error: "Calendar rates failed to fetch" });
  }
});
  // try {
  //   const data = await getCalendarRates();
  //   const eurPerUsd = await getEurToUsdExchangeRate();
  //   const dataInEur = [];
  //   if (data && typeof eurPerUsd === 'number') {
  //     for (const [date, rate] of Object.entries(data)) {
  //       if (typeof rate === 'number') {
  //         dataInEur.push({ date, eurPerTon: rate * 2204.62 * eurPerUsd });
  //       }
  //     }
  //   }
  //   res.json(dataInEur);
  // } catch (err) {
  //   console.error("[server.js] Error in /exchange-rate/last-month:", err)
  //   res.status(500).json({ error: "Calendar rates failed to fetch"});
  // }

// const eurPerUsd = await getEurToUsdExchangeRate();
// for (const date of uncachedDates) {
//   if (rates[date] && typeof rates[date].XCU === "number") {
//     const usdPerLb = rates[date].XCU;
//     calendarRates[date] = usdPerLb * 2204.62 * eurPerUsd; // Convert to EUR/tonne
//     cachedCalendarRate[date] = calendarRates[date];
//   } else {
//     calendarRates[date] = null;
//   }
// }


// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(searchRoutes);
app.use(cookieParser());

// Routes
// Redirect .html URLs to clean URLs
app.get("/:page.html", (req, res) => {
  console.log(`Redirecting ${req.url} to /${req.params.page}`);
  res.redirect(301, "/" + req.params.page);
});

// Handle root path
app.get("/", (req, res, next) => {
  const filePath = path.join(__dirname, "dist", "index.html");
  console.log(`Serving root: ${filePath}`);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(`Error serving index.html:`, err.message);
      next();
    }
  });
});

// Handle other pages (but exclude static file extensions)
app.get("/:page", (req, res, next) => {
  const page = req.params.page;
  
  // Skip if this looks like a static file request
  const staticExtensions = /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip|mp4|webm|mov)$/i;
  if (staticExtensions.test(page)) {
    console.log(`Skipping page route for static file: ${page}`);
    return next(); // Let static middleware handle it
  }
  
  // Skip if this is a path with a directory (like css/style.min.css)
  if (page.includes('.') && !page.endsWith('.html')) {
    console.log(`Skipping page route for file with extension: ${page}`);
    return next(); // Let static middleware handle it
  }
  
  const filePath = path.join(__dirname, "dist", `${page}.html`);
  
  // Check if file exists before trying to serve
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${filePath}`);
    return next(); // Pass to 404 handler
  }
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(`Error serving ${filePath}:`, err.message);
      next();
    } else {
      console.log(`Successfully served: ${filePath}`);
    }
  });
});

app.post('/submit-form', [
  body('company').trim().escape(),
  body('fullName', 'Nom requis').trim().isLength({ min: 2 }),
  body('telephone', 'Numéro de téléphone invalide').isMobilePhone('fr-FR'),
  body('email', 'Adresse email invalide').isEmail()
], async (req, res) => {
      console.log("Incoming form data:", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const transporter = nodemailer.createTransport({
          port: 587,
          secure: false,
          auth: {
            user: USER_EMAIL,
            pass: USER_PASS
          }
      });

      const { company, fullName, telephone, email } = req.body;

  // // Define the email content
  //     const mailOptions = {
  //     from: "smtp.office365.com",
  //     to: 'c.rey@gseuro.fr', // Where the message will be sent
  //     subject: 'Nouveau message du formulaire de contact',
  //     text: `Société: ${company || 'Non précisé'}, Nom: ${fullName}, Téléphone: ${telephone}, Email: ${email}`
  //   };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Message envoyé avec succès !" });
  } catch (error) {
    console.error("Erreur d'envoi d'email:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de l'envoi du message." });
  }
});

// Static files AFTER dynamic routes to avoid conflicts
app.use(express.static(path.join(__dirname, 'dist')));

// Also handle requests that might have subdirectories but still be static files
app.use('/css', express.static(path.join(__dirname, 'dist/css')));
app.use('/js', express.static(path.join(__dirname, 'dist/js')));
app.use('/img', express.static(path.join(__dirname, 'dist/img')));
app.use('/images', express.static(path.join(__dirname, 'dist/images')));
app.use('/assets', express.static(path.join(__dirname, 'dist/assets')));
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});