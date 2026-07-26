import Stripe from "stripe";

export const stripeFeatured = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const FEATURED_PRICE_ID = process.env.STRIPE_FEATURED_PRICE_ID!;
