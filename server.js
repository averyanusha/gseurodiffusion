import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { body, validationResult } from "express-validator";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import {getCurrentExchangeRate, getMonthsRates, getCalendarRates } from "./exchangeRate.js";
import { createRequire } from "module";
import searchRoutes from "./search.js"

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://gseurodiffusion.fr', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.options(/.*/, cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(searchRoutes);
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ status: 'Backend API is running' });
});

app.get("/exchange-rate", async (req, res) => {
  try {
    const data = await getCurrentExchangeRate();
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



// Routes
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

app.post('/api/submit-form', [
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
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.verify();
      console.log("Server is ready to take our messages");
    } catch (err) {
      console.error("Verification failed:", err);
    }

    const { company, fullName, telephone, email, message } = req.body;

    const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'c.rey@gseurodiffusion.fr',
    subject: 'Nouveau message du formulaire de contact',
    html: `
    <h2>Vous etiez contacté par</h2>
    <p><strong>Société:</strong> ${company || 'Non précisé'}</p>
    <p><strong>Nom:</strong> ${fullName}</p>
    <p><strong>Téléphone:</strong> ${telephone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong> ${message ? message.value : 'Non précisé'}</p>`,
    replyTo: email,
    encoding: 'utf8'
  };

    try {
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: "Message envoyé avec succès !" });
    } catch (error) {
      console.error("Erreur d'envoi d'email:", error);
      return res.status(500).json({ success: false, message: "Erreur lors de l'envoi du message." });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});