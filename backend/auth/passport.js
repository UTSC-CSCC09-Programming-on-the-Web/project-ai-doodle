import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

function generateShortId(length = 6) {
  return crypto.randomUUID().replace(/-/g, "").slice(0, length);
}

async function generateUniqueUsername(base) {
  let candidate = base;
  while (await User.findOne({ where: { username: candidate } })) {
    candidate = base + generateShortId();
  }
  return candidate;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email in Google profile"), null);

        let user = await User.findOne({ where: { email } });

        if (!user) {
          const baseUsername = profile.displayName
            .replace(/\s+/g, "")
            .toLowerCase();
          const username = await generateUniqueUsername(baseUsername);

          user = await User.create({
            googleId: profile.id,
            email,
            username,
            nickname: profile.displayName,
            isSubscribed: false,
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("Google login error:", err);
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
