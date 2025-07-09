import { Router } from "express";
import passport from "passport";

export const authRouter = Router();

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
  }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/failure",
    session: true,
  }),
  (req, res) => {
    // 直接跳转到主页，绕过订阅检查
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  },
);

authRouter.get("/me", (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({
      userId: req.user.id,
      username: req.user.username,
      isSubscribed: req.user.isSubscribed,
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

authRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Session destroy failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

authRouter.get("/failure", (req, res) => {
  res.status(401).json({ error: "Authentication failed" });
});
