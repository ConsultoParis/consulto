import Stripe from "stripe";

export const stripeFeatured = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const FEATURED_PRICE_ID = process.env.STRIPE_FEATURED_PRICE_ID!;
