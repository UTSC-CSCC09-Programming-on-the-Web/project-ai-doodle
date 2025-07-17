import { Router } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { User } from "../models/user.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripeRouter = Router();

stripeRouter.post("/checkout", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/home`,
      cancel_url: `${process.env.FRONTEND_URL}/subscribe`,
      customer_email: req.user.email,
      metadata: { userId: req.user.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create session", details: err.message });
  }
});

stripeRouter.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata && session.metadata.userId;

          if (!userId) {
            console.error("Missing userId in metadata");
            return res.status(400).send("Missing userId in metadata");
          }

          await User.update({ isSubscribed: true }, { where: { id: userId } });

          console.log(`User ${userId} subscription activated`);
          break;
        }

        case "invoice.payment_failed":
          console.warn("Payment failed:", event.data.object.id);
          break;

        case "customer.subscription.deleted":
          console.warn("Subscription cancelled:", event.data.object.id);
          // TODO
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err);
      res.status(500).send("Internal Server Error");
    }
  },
);
