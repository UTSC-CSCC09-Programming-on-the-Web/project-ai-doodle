import https from "https";
https.globalAgent.options.rejectUnauthorized = false;

import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import "./auth/passport.js";
import { authRouter } from "./routers/auth_router.js";
import { stripeRouter } from "./routers/stripe_router.js";
import { roomRouter } from "./routers/room_router.js";

import { testConnection, sequelize } from "./models/datasource.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripe/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  }),
);

// Google OAuth2.0
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend is running" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/rooms", roomRouter);

const init = async () => {
  await testConnection();
  await sequelize.sync({ alter: true });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

init();
